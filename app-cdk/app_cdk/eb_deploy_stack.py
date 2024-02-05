from aws_cdk import (
    aws_codepipeline as codepipeline,
    aws_codepipeline_actions as codepipeline_actions,
    aws_iam as iam,
    aws_s3_assets as s3_assets,
    aws_elasticbeanstalk as elasticbeanstalk,
    core as cdk
)
from eb_stack_appln import EBApplnStack



class CdkEBStage(cdk.Stage):
    def __init__(self, scope: cdk.Construct, id: str, props: dict = None):
        super().__init__(scope, id, props)

        service = EBApplnStack(
            self, 'WebService',
            min_size=props.get('min_size'),
            max_size=props.get('max_size'),
            instance_types=props.get('instance_types'),
            env_name=props.get('env_name')
        )

