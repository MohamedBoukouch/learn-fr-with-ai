# --------------------------------------------------
# PostgreSQL EC2
# --------------------------------------------------

resource "aws_instance" "database" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type

  subnet_id = aws_subnet.private[0].id

  vpc_security_group_ids = [
    aws_security_group.database.id
  ]

  key_name = var.key_name

  user_data = <<-EOF
              #!/bin/bash

              dnf update -y

              dnf install -y postgresql16-server

              postgresql-setup --initdb

              systemctl enable postgresql
              systemctl start postgresql

              sudo -u postgres psql <<SQL
              CREATE USER ${var.db_username} WITH PASSWORD '${var.db_password}';
              CREATE DATABASE ${var.db_name} OWNER ${var.db_username};
              GRANT ALL PRIVILEGES ON DATABASE ${var.db_name} TO ${var.db_username};
              SQL
              EOF

  tags = {
    Name = "${var.project_name}-${var.environment}-postgresql"
  }
}