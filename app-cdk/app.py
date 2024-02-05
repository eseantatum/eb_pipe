#!/usr/bin/env python3
import aws_cdk as cdk

from app_cdk.app_cdk_stack import AppCdkStack
from app_cdk.pipeline_cdk_stack import CdkPipelineStack
from app_cdk.eb_stack_appln import EBApplnStack

app = cdk.App()

ecr_stack = EBApplnStack(
    app,
    'ecr-stack-eb'
)

pipeline_stack = CdkPipelineStack(
    app,
    'pipeline-stack-eb',
    ecr_repository = ecr_stack.ecr_data,
)

app.synth()
