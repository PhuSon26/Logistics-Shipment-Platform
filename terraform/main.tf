# ==========================================
# VPC
# ==========================================
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "logistics-vpc"
  }
}

# ==========================================
# INTERNET GATEWAY
# ==========================================
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "logistics-igw"
  }
}

# ==========================================
# PUBLIC SUBNET
# ==========================================
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "logistics-public-subnet"
    Type = "Public"
  }
}

# ==========================================
# PRIVATE SUBNET
# ==========================================
resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr
  availability_zone = "us-east-1a"

  tags = {
    Name = "logistics-private-subnet"
    Type = "Private"
  }
}

# ==========================================
# PUBLIC ROUTE TABLE
# ==========================================
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "logistics-public-rt"
  }
}

# ==========================================
# PUBLIC ROUTE TABLE ASSOCIATION
# ==========================================
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ==========================================
# PRIVATE ROUTE TABLE
# ==========================================
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "logistics-private-rt"
  }
}

# ==========================================
# PRIVATE ROUTE TABLE ASSOCIATION
# ==========================================
resource "aws_route_table_association" "private" {
  subnet_id      = aws_subnet.private.id
  route_table_id = aws_route_table.private.id
}

# ==========================================
# SECURITY GROUP
# ==========================================
resource "aws_security_group" "main" {
  name        = "logistics-k8s-nodes-sg"
  description = "Security group for Kubernetes nodes"
  vpc_id      = aws_vpc.main.id

  # SSH - Administrator only
  ingress {
    description = "SSH from administrator"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  # Kubernetes API Server - Administrator only
  ingress {
    description = "Kubernetes API Server"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  # Allow all traffic between Kubernetes nodes
  ingress {
    description = "Internal Kubernetes node communication"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  # Outbound internet access
  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "logistics-k8s-nodes-sg"
  }
}