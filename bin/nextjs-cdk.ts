#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { NextjsCdkStack } from '../lib/nextjs-cdk-stack';

const app = new cdk.App();
new NextjsCdkStack(app, 'NextjsCdkStack');
