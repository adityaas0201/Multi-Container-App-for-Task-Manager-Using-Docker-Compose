
resource "aws_eip" "nat" {
  domain = "vpc"

  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name    = "taskmanager-nat-eip"
    Project = "chapter28-task-manager"
  }
}

resource "aws_nat_gateway" "task_manager" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_a.id

  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name    = "taskmanager-nat-a"
    Project = "chapter28-task-manager"
  }
}
