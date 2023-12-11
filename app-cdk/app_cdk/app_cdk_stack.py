from constructs import Construct
from aws_cdk import (
    Stack,
    Duration,
)

class AppCdkStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, ecr_repository, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
