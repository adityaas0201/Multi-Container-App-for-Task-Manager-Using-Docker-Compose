
resource "aws_route_table" "private_data" {
  vpc_id = aws_vpc.task_manager.id

  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name    = "taskmanager-data-private-rt"
    Project = "chapter28-task-manager"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.task_manager.id

  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name    = "taskmanager-public-rt"
    Project = "chapter28-task-manager"
  }
}

resource "aws_route_table" "private_app" {
  vpc_id = aws_vpc.task_manager.id

  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name    = "taskmanager-app-private-rt"
    Project = "chapter28-task-manager"
  }
}

resource "aws_route_table" "main" {
  vpc_id = aws_vpc.task_manager.id

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_route_table_association" "private_data_a" {
  subnet_id      = aws_subnet.private_data_a.id
  route_table_id = aws_route_table.private_data.id
}

resource "aws_route_table_association" "private_data_b" {
  subnet_id      = aws_subnet.private_data_b.id
  route_table_id = aws_route_table.private_data.id
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_app_a" {
  subnet_id      = aws_subnet.private_app_a.id
  route_table_id = aws_route_table.private_app.id
}

resource "aws_route_table_association" "private_app_b" {
  subnet_id      = aws_subnet.private_app_b.id
  route_table_id = aws_route_table.private_app.id
}

resource "aws_route" "public_default" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.task_manager.id
}

resource "aws_route" "private_app_default" {
  route_table_id         = aws_route_table.private_app.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.task_manager.id
}

resource "aws_vpc_endpoint_route_table_association" "private_app" {
  vpc_endpoint_id = aws_vpc_endpoint.s3.id
  route_table_id  = aws_route_table.private_app.id
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = "vpc-09dca30c0d24d2f87"
  service_name      = "com.amazonaws.ap-south-1.s3"
  vpc_endpoint_type = "Gateway"

  route_table_ids = ["rtb-0bcf96ecc5a2abf2a"]

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name    = "taskmanager-s3-gateway-endpoint"
    Project = "chapter28-task-manager"
  }
}