# NextJS Serverless CDK

A CDK deploy to cloudfront distributions of https://github.com/vercel/next.js using https://github.com/serverless-nextjs/serverless-next.js for AWS compatibility.

**This is a spike of an Application, not a construct.**

**There are no defined caching strategies and all s3 assets are purged for every deploy**

**Experimental AWS-CDK constructs have been used, see:**
- [@aws-cdk/aws-cloudfront](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-cloudfront-readme.html#distribution-api---experimental)
- [@aws-cdk/aws-s3-deployment](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-deployment-readme.html)

## Official Support

Serverless next JS has a construct for this now: https://github.com/serverless-nextjs/serverless-next.js/pull/878

## Example

The example page is here - https://d3a8vzm1ccycvj.cloudfront.net/

## Features

- [ ] CDK Synth builds nextJS application using [@sls-next/lambda-at-edge](https://github.com/serverless-nextjs/serverless-next.js/tree/master/packages/libs/lambda-at-edge)
- [ ] Support for API pages using [@sls-next/lambda-at-edge](https://github.com/serverless-nextjs/serverless-next.js/tree/master/packages/libs/lambda-at-edge)
- [ ] Deploys Lambda at edge and S3 Assets using AWS-CDK.
- [ ] Routing and caching configuration is extensible through AWS-CDK cloudfront behaviors.

## Deploy

- Deploys to `us-east-1`
- Uses cloudformation single stack as [resource limit has recently be raised from 200 to 500](https://aws.amazon.com/about-aws/whats-new/2020/10/aws-cloudformation-now-supports-increased-limits-on-five-service-quotas/#:~:text=AWS%20CloudFormation%20now%20supports%20increased%20limits%20on%20five%20service%20quotas,-Posted%20On%3A%20Oct&text=Oct%2022%2C%202020-,AWS%20CloudFormation%20now%20supports%20increased%20limits%20on%20five%20service%20quotas,now%201MB%20(previously%20450KB).)

```
export AWS_PROFILE=<your-aws-profile>

yarn cdk bootstrap

yarn build

yarn cdk synth

yarn cdk deploy
```

## Removing

```
export AWS_PROFILE=<your-aws-profile>

yarn cdk destroy
```
