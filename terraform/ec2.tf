# --------------------------------------------------
# Amazon Linux 2023 AMI
# --------------------------------------------------

data "aws_ami" "amazon_linux" {
  most_recent = true

  owners = ["137112412989"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

# --------------------------------------------------
# Backend EC2 Instances
# --------------------------------------------------

resource "aws_instance" "backend" {
  count = 2

  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type

  subnet_id = aws_subnet.public[count.index].id

  vpc_security_group_ids = [
    aws_security_group.backend.id
  ]

  key_name = var.key_name

  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash

              dnf update -y

              dnf install -y java-21-amazon-corretto

              mkdir -p /opt/backend

              echo "Backend server ${count.index + 1}" > /opt/backend/index.html
              EOF

  tags = {
    Name = "${var.project_name}-${var.environment}-backend-${count.index + 1}"
  }
}