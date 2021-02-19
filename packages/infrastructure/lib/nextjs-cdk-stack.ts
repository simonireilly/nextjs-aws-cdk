import * as cdk from '@aws-cdk/core'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as origins from '@aws-cdk/aws-cloudfront-origins'
import * as lambda from '@aws-cdk/aws-lambda'
import * as s3 from '@aws-cdk/aws-s3'
import * as s3deploy from '@aws-cdk/aws-s3-deployment'
import * as acm from '@aws-cdk/aws-certificatemanager'
import * as r53 from '@aws-cdk/aws-route53'

import * as path from 'path'
import { Builder } from '@sls-next/lambda-at-edge'

// The builder wraps nextJS in Compatibility layers for Lambda@Edge; handles the page
// manifest and creating the default-lambda and api-lambda. The final output is an assets
// folder which can be uploaded to s3 on every deploy.
const nextConfigDir = '../application';
const cwd = path.join(process.cwd(), nextConfigDir)
const outputDir = path.join(nextConfigDir, ".serverless_nextjs");

const options = {
  cmd: path.join(cwd, '/node_modules/.bin/next'),
  cwd: cwd,
  env: {},
  args: ['build']
}

const builder = new Builder(
  nextConfigDir,
  outputDir,
  options
);

export class NextjsCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    builder.build().then(() => {
      // Lambda functions for handling edge page requests
      const defaultLambda = new lambda.Function(this, 'defaultEdgeLambda', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(path.join(outputDir, 'default-lambda')),
      });

      // Lambda functions for handling edge api requests
      const apiLambda = new lambda.Function(this, 'apiEdgeLambda', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(path.join(outputDir, 'api-lambda')),
      });

      // Lambda functions for handling images
      const imageLambda = new lambda.Function(this, 'imageEdgeLambda', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(path.join(outputDir, 'image-lambda')),
      });

      // Static Asset bucket for cloudfront distribution as default origin
      const myBucket = new s3.Bucket(this, 'myBucket', {});

      // Allow images to be fetched
      myBucket.grantRead(imageLambda)

      const origin = new origins.S3Origin(myBucket);

      // Default distribution requests to the default lambda
      const distribution = new cloudfront.Distribution(this, 'myDist', {
        defaultBehavior: {
          origin: origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          edgeLambdas: [
            {
              functionVersion: defaultLambda.currentVersion,
              eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
            }
          ],
        },
        enableLogging: true,
      });

      // Forward static file request to s3 directly
      distribution.addBehavior('_next/static/*', origin, {});

      // Forward API requests to the API edge lambda
      distribution.addBehavior('api/*', origin, {
        edgeLambdas: [
          {
            functionVersion: apiLambda.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
            includeBody: true
          },
        ],
      });

      // Image cache policy extends the default cache policy, but with query params
      const imageCachePolicy = new cloudfront.CachePolicy(this, 'imageCachePolicy', {
        ...cloudfront.CachePolicy.CACHING_OPTIMIZED,
        cachePolicyName: 'ImageCachingPolicy',
        comment: 'Policy to cache images for _next/image',
        queryStringBehavior: cloudfront.CacheQueryStringBehavior.allowList(...['url', 'w', 'q']),
      });

      // Forward image requests
      distribution.addBehavior('_next/image*', origin, {
        edgeLambdas: [
          {
            functionVersion: imageLambda.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
          },
        ],
        cachePolicy: imageCachePolicy
      });
      // Upload deployment bucket
      new s3deploy.BucketDeployment(this, 'nextJsAssets', {
        sources: [s3deploy.Source.asset(path.join(outputDir, 'assets'))],
        destinationBucket: myBucket,
        distribution: distribution,
      });

      new cdk.CfnOutput(this, 'DistributionDomain', {
        value: `https://${distribution.distributionDomainName}`,
      });
    }).catch((err) => {
      console.warn('Build failed for NextJS, aborting CDK operation')
      console.error({ err })
      throw err
    })

  }
}
