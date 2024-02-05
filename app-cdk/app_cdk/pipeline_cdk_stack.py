from aws_cdk import (
    aws_codepipeline as codepipeline,
    aws_codepipeline_actions as codepipeline_actions,
    aws_iam as iam,
    aws_s3_assets as s3_assets,
    aws_elasticbeanstalk as elasticbeanstalk,
    core as cdk
)
from eb_deploy_stack import CdkEBStage


class CdkPipelineStack(cdk.Stack):
    def __init__(self, scope: cdk.Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        pipeline = codepipeline.Pipeline(
            self, 'Pipeline',
            pipeline_name='MyServicePipeline',
            synth=codepipeline.ShellStep(
                'Synth',
                input=codepipeline_actions.GitHubSourceAction(
                    action_name='GitHub',
                    output=codepipeline.Artifact(),
                    oauth_token=cdk.SecretValue.secrets_manager('github-token'),
                    owner='eseantatum',
                    repo='eb_tut',
                    branch='main'
                ),
                commands=[
                    'npm i -g npm@latest',
                    'npm ci',
                    'npm run build',
                    'npx cdk synth'
                ]
            )
        )

        deploy = CdkEBStage(
            self, 'Pre-Prod',
            min_size='1',
            max_size='2'
        )
        deploy_stage = pipeline.add_stage(stage_name='Deploy')
        deploy_stage.add_action(
            codepipeline_actions.CloudFormationCreateReplaceChangeSetAction(
                action_name='CreateChangeSet',
                stack_name=deploy.stack_name,
                change_set_name='DeployChangeSet',
                template_path=pipeline.artifact_stages['Synth'].output_artifacts[0].file_path,
                admin_permissions=True
            )
        )


app = cdk.App()
CdkPipelineStack(
    app, 'CdkPipelineStack',
    env={'account': '295939261429', 'region': 'us-gov-west-1'}
)
app.synth()
