variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "admin_cidr" {
  description = "My public IPv4 address with /32"
  type        = string
}

variable "key_name" {
  description = "Existing keypair"
  type        = string
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  type    = string
  default = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  type    = string
  default = "10.0.2.0/24"
}

variable "aws_ec2_ami" {
  type    = string
  default = "ami-02a9cdd4e98bc3c78"
}

variable "aws_ec2_instance_type" {
  type    = string
  default = "t3.medium"
}