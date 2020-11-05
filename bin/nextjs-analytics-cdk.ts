#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { NextjsAnalyticsCdkStack } from '../lib/nextjs-analytics-cdk-stack';

const app = new cdk.App();
new NextjsAnalyticsCdkStack(app, 'NextjsAnalyticsCdkStack');
