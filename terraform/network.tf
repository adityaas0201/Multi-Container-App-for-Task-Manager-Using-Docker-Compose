
resource "aws_vpc" "task_manager" {
  cidr_block           = "10.20.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = false

  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name    = "taskmanager-vpc"
    Project = "chapter28-task-manager"
  }
}

resource "aws_internet_gateway" "task_manager" {
  vpc_id = aws_vpc.task_manager.id

  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name    = "taskmanager-igw"
    Project = "chapter28-task-manager"
  }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.task_manager.id
  cidr_block              = "10.20.0.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = true

  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name = "taskmanager-public-a"
    Tier = "public"
  }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.task_manager.id
  cidr_block              = "10.20.1.0/24"
  availability_zone       = "ap-south-1b"
  map_public_ip_on_launch = true

  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name = "taskmanager-public-b"
    Tier = "public"
  }
}

resource "aws_subnet" "private_app_a" {
  vpc_id                  = aws_vpc.task_manager.id
  cidr_block              = "10.20.10.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = false

  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name = "taskmanager-app-a"
    Tier = "application"
  }
}

resource "aws_subnet" "private_app_b" {
  vpc_id                  = aws_vpc.task_manager.id
  cidr_block              = "10.20.11.0/24"
  availability_zone       = "ap-south-1b"
  map_public_ip_on_launch = false

  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name = "taskmanager-app-b"
    Tier = "application"
  }
}

resource "aws_subnet" "private_data_a" {
  vpc_id                  = aws_vpc.task_manager.id
  cidr_block              = "10.20.20.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = false

  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name = "taskmanager-data-a"
    Tier = "data"
  }
}

resource "aws_subnet" "private_data_b" {
  vpc_id                  = aws_vpc.task_manager.id
  cidr_block              = "10.20.21.0/24"
  availability_zone       = "ap-south-1b"
  map_public_ip_on_launch = false

  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name = "taskmanager-data-b"
    Tier = "data"
  }
}
