
resource "aws_iam_role_policy_attachment" "execution_managed" {
  role = aws_iam_role.ecs_task_execution.name

  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "migration_secrets_manager_readonly" {
  role = aws_iam_role.migration_task.name

  policy_arn = "arn:aws:iam::aws:policy/AWSSecretsManagerClientReadOnlyAccess"
}
