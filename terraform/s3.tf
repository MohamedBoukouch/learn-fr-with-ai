resource "aws_s3_bucket" "frontend" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  depends_on = [
    aws_s3_bucket_public_access_block.frontend
  ]

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"

        Action = [
          "s3:GetObject"
        ]

        Resource = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

locals {
  frontend_dist_path = "${path.module}/../frontend/dist"

  mime_types = {
    html = "text/html"
    css  = "text/css"
    js   = "application/javascript"
    mjs  = "application/javascript"
    json = "application/json"
    png  = "image/png"
    jpg  = "image/jpeg"
    jpeg = "image/jpeg"
    gif  = "image/gif"
    svg  = "image/svg+xml"
    ico  = "image/x-icon"
    webp = "image/webp"
    txt  = "text/plain"
    xml  = "application/xml"
    wasm = "application/wasm"
    map  = "application/json"
  }
}

resource "aws_s3_object" "frontend_files" {
  for_each = fileset(local.frontend_dist_path, "**/*")

  bucket = aws_s3_bucket.frontend.id

  key = each.value

  source = "${local.frontend_dist_path}/${each.value}"

  etag = filemd5("${local.frontend_dist_path}/${each.value}")

  content_type = lookup(
    local.mime_types,
    lower(element(split(".", each.value), length(split(".", each.value)) - 1)),
    "application/octet-stream"
  )

  depends_on = [
    aws_s3_bucket_policy.frontend
  ]
}