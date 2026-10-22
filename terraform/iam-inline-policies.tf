
resource "aws_iam_role_policy" "api_secret_access" {
  name = "TaskManagerApiSecretAccess"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ReadTaskManagerApiDatabaseSecret"
        Effect   = "Allow"
        Action   = "secretsmanager:GetSecretValue"
        Resource = "arn:aws:secretsmanager:ap-south-1:749771281164:secret:taskmanager/api-db-*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "bootstrap_secret_access" {
  name = "TaskManagerBootstrapSecretAccess"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ReadRDSMasterSecret"
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = "arn:aws:secretsmanager:ap-south-1:749771281164:secret:rds!db-b267ebee-c38a-4e4c-93b5-065d9e3ca3af-e5cr5e"
      },
      {
        Sid      = "CreateTaskManagerDatabaseSecrets"
        Effect   = "Allow"
        Action   = ["secretsmanager:CreateSecret"]
        Resource = "*"
        Condition = {
          StringEquals = {
            "aws:RequestTag/Project" = "chapter28-task-manager"
          }
        }
      },
      {
        Sid    = "UpdateTaskManagerDatabaseSecrets"
        Effect = "Allow"
        Action = [
          "secretsmanager:PutSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          "arn:aws:secretsmanager:ap-south-1:749771281164:secret:taskmanager/api-db-*",
          "arn:aws:secretsmanager:ap-south-1:749771281164:secret:taskmanager/migrator-db-*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy" "migrator_secret_access" {
  name = "TaskManagerMigratorSecretAccess"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ReadTaskManagerMigratorSecret"
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = "arn:aws:secretsmanager:ap-south-1:749771281164:secret:taskmanager/migrator-db-*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "valkey_connect" {
  name = "TaskManagerValkeyConnectPolicy"
  role = aws_iam_role.app_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ConnectToTaskManagerValkey"
        Effect = "Allow"
        Action = "elasticache:Connect"
        Resource = [
          "arn:aws:elasticache:ap-south-1:749771281164:replicationgroup:chapter28-task-manager-redis",
          "arn:aws:elasticache:ap-south-1:749771281164:user:taskmanager-app"
        ]
      }
    ]
  })
}
