terraform {
  backend "s3" {
    bucket       = "task-manager-tfstate-749771281164-ap-south-1"
    key          = "task-manager/dev/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }
}