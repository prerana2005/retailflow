variable "vpc_id" {}
variable "subnet_ids" { type = list(string) }

resource "aws_db_subnet_group" "main" {
  name       = "retailflow-db-subnet"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "rds" {
  name   = "retailflow-rds-sg"
  vpc_id = var.vpc_id
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}

resource "aws_db_instance" "postgres" {
  identifier           = "retailflow-postgres"
  engine               = "postgres"
  engine_version       = "15"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  db_name              = "productsdb"
  username             = "user"
  password             = "password123"
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot  = true
}

output "rds_endpoint" { value = aws_db_instance.postgres.endpoint }
