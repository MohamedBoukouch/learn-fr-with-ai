variable "aws_region" {
  description = "AWS region where the infrastructure will be created"
  type        = string
  default     = "eu-west-3"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "Lear-fr"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name"
  type        = string
}