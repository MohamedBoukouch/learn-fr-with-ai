output "s3_bucket_name" {
  description = "Name of the frontend S3 bucket"
  value       = aws_s3_bucket.frontend.bucket
}

output "s3_bucket_arn" {
  description = "ARN of the frontend S3 bucket"
  value       = aws_s3_bucket.frontend.arn
}

output "website_url" {
  description = "S3 static website URL"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}


output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "backend_public_ips" {
  description = "Public IP addresses of backend EC2 instances"
  value       = aws_instance.backend[*].public_ip
}

output "backend_instance_ids" {
  description = "Backend EC2 instance IDs"
  value       = aws_instance.backend[*].id
}

output "database_private_ip" {
  description = "Private IP address of PostgreSQL EC2"
  value       = aws_instance.database.private_ip
}

output "database_instance_id" {
  description = "PostgreSQL EC2 instance ID"
  value       = aws_instance.database.id
}