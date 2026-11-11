provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project = "logistics-shipment-platform"
      Environment = "Lab"
      ManagedBy = "Terraform"
    }
  }
}