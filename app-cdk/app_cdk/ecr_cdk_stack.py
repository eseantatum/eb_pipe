from constructs import Construct
from aws_cdk import (
    Stack,
    aws_ecr as ecr,
    RemovalPolicy
)

class EcrCdkStack(Stack):

    @property
    def ecr_data(self):
        return self.ecr

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        #ecr_repository = ecr.Repository(
        #    self, 'my-app', 
        #    removal_policy = RemovalPolicy.DESTROY
        #)

        services = ['api', 'client', 'db', 'worker', 'redis']  # Define your services here

        # Create an ECR repository for each service
        for service in services:
            repository = ecr.Repository(self, f"{service}_repository",
                                        repository_name=service)  # Set the repository name to the service name

            # Push the image to the respective ECR repository
            image = ecr.Repository.from_repository_name(self, f"{service}_image", service)
            # Push your Docker image to ECR, using your IMAGE_REPO_URI and service name
            # Note: You'd need to replace this with your actual Docker push command in your CDK script
            # Example: image.add_image_tag('latest').add_image_tag(service)
            # For Python, the API might look a bit different, depending

        self.ecr = repository

    
