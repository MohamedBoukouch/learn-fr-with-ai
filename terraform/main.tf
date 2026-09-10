resource "aws_s3_bucket" "frontend" {
  bucket = var.bucket_name

  tags = {
    Name        = "${var.project_name}-frontend"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}