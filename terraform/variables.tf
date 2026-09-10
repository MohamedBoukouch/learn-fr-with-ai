variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "eu-west-3"
}

variable "aws_profile" {
  description = "AWS CLI profile used by Terraform"
  type        = string
  default     = "terraform-dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "my-project"
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