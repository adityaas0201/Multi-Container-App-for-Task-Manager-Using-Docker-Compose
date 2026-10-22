variable "project_name" {
  description = "Name of the application"
  type        = string
  default     = "task-manager"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "aws_region" {
  description = "AWS region for this deployment"
  type        = string
  default     = "ap-south-1"
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)

  default = {
    Project   = "task-manager"
    ManagedBy = "Terraform"
  }
}