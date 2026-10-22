locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = merge(
    var.tags,
    {
      Environment = var.environment
      Region      = var.aws_region
    }
  )
  service_names = toset(["api", "frontend"])

  service_name_map = {
    for service in local.service_names :
    service => "${local.name_prefix}-${service}"
  }

  desired_task_count = var.environment == "production" ? 3 : 1

  uppercase_service_names = [
    for service in local.service_names : upper(service)
  ]

  selected_tags = {
    for key, value in local.common_tags :
    key => value if key != "Region"
  }
}