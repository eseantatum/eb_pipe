from aws_cdk import (
    aws_codepipeline as codepipeline,
    aws_codepipeline_actions as codepipeline_actions,
    aws_iam as iam,
    aws_s3_assets as s3_assets,
    aws_elasticbeanstalk as elasticbeanstalk,
#    core as cdk
)


class EBApplnStack(cdk.Stack):
    def __init__(self, scope: cdk.Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        web_app_zip_archive = s3_assets.Asset(
            self, 'WebAppZip',
            path=__file__ + '../../my-app'
        )

        app_name = 'MyWebApp'
        app = elasticbeanstalk.CfnApplication(
            self, 'Application',
            application_name=app_name
        )

        app_version_props = elasticbeanstalk.CfnApplicationVersion(
            self, 'AppVersion',
            application_name=app_name,
            source_bundle={
                's3Bucket': web_app_zip_archive.s3_bucket_name,
                's3Key': web_app_zip_archive.s3_object_key
            }
        )
        app_version_props.add_dependency(app)

        my_role = iam.Role(
            self, f'{app_name}-aws-elasticbeanstalk-ec2-role',
            assumed_by=iam.ServicePrincipal('ec2.amazonaws.com')
        )
        my_role.add_managed_policy(
            iam.ManagedPolicy.from_aws_managed_policy_name(
                'AWSElasticBeanstalkWebTier'
            )
        )
        my_profile_name = f'{app_name}-InstanceProfile'
        instance_profile = iam.CfnInstanceProfile(
            self, my_profile_name,
            instance_profile_name=my_profile_name,
            roles=[my_role.role_name]
        )

        option_setting_properties = [
            {
                'namespace': 'aws:autoscaling:launchconfiguration',
                'optionName': 'IamInstanceProfile',
                'value': my_profile_name
            },
            {
                'namespace': 'aws:autoscaling:asg',
                'optionName': 'MinSize',
                'value': kwargs.get('max_size', '1')
            },
            {
                'namespace': 'aws:autoscaling:asg',
                'optionName': 'MaxSize',
                'value': kwargs.get('max_size', '1')
            },
            {
                'namespace': 'aws:ec2:instances',
                'optionName': 'InstanceTypes',
                'value': kwargs.get('instance_types', 't2.micro')
            }
        ]

        elb_env = elasticbeanstalk.CfnEnvironment(
            self, 'Environment',
            environment_name=kwargs.get('env_name', 'MyWebAppEnvironment'),
            application_name=app.application_name,
            solution_stack_name='64bit Amazon Linux 2 v5.8.0 running Node.js 18',
            option_settings=option_setting_properties,
            version_label=app_version_props.ref
        )
