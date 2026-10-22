output "aws_account_id" {
  description = "AWS account used by the provider"
  value       = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  description = "Configured AWS region"
  value       = data.aws_region.current.region
}

output "project_name_prefix" {
  description = "Standardized project and environment name"
  value       = local.name_prefix
}

output "common_tags" {
  description = "Tags calculated for this environment"
  value       = local.common_tags
}

