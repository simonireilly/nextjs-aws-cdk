import * as cdk from '@aws-cdk/core'
import { NextJSLambdaEdge } from '@sls-next/cdk-construct'
import * as path from 'path'

const nextConfigDir = '../application';
const outputDir = path.join(nextConfigDir, ".serverless_nextjs");

export class NextjsCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const nextJsSite = new NextJSLambdaEdge(this, "NextJsApp", {
      serverlessBuildOutDir: outputDir
    });

    new cdk.CfnOutput(this, 'DistributionDomain', {
      value: `https://${nextJsSite.distribution.distributionDomainName}`,
    });
  }
}
