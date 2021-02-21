#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { NextjsCdkStack } from '../lib/nextjs-cdk-stack';
import { Builder } from '@sls-next/lambda-at-edge'
import * as path from 'path'

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


builder
  .build()
  .then(() => {
    const app = new cdk.App();
    new NextjsCdkStack(app, `MyStack`);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
