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
  availability_zone       = "us-west-2a"
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
  availability_zone = "us-west-2a"

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