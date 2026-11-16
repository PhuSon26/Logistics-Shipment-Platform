# ==========================================
# UBUNTU 24.04 AMI
# ==========================================
data "aws_ssm_parameter" "ubuntu_ami" {
  name = "/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id"
}
# ==========================================
# KUBERNETES EC2 INSTANCES
# ==========================================
locals {
  k8s_nodes = {
    control-plane = {
      instance_type = var.aws_ec2_instance_type
      volume_size   = 30
      sg_id         = aws_security_group.k8s_control_plane.id
    }

    worker1 = {
      instance_type = var.aws_ec2_instance_type
      volume_size   = 50
      sg_id         = aws_security_group.k8s_workers.id
    }

    worker2 = {
      instance_type = var.aws_ec2_instance_type
      volume_size   = 50
      sg_id         = aws_security_group.k8s_workers.id
    }
  }
}

resource "aws_instance" "k8s_nodes" {
  for_each = local.k8s_nodes

  ami                         = data.aws_ssm_parameter.ubuntu_ami.value
  instance_type               = each.value.instance_type
  key_name                    = var.key_name
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [each.value.sg_id]
  associate_public_ip_address = true

  root_block_device {
    volume_size           = each.value.volume_size
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tags = {
    Name = "logistics-${each.key}"
    Role = each.key
  }
}

# ==========================================
# ANSIBLE CONTROLLER EC2 INSTANCE
# ==========================================
resource "aws_instance" "ansible_controller" {
  ami                         = data.aws_ssm_parameter.ubuntu_ami.value
  instance_type               = "t3.small"
  key_name                    = var.key_name
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.ansible.id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              export DEBIAN_FRONTEND=noninteractive
              apt-get update -y
              apt-get install -y ansible
              EOF

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tags = {
    Name = "logistics-ansible-controller"
    Role = "ansible-controller"
  }
}

resource "aws_instance" "jenkins_server" {
  ami                         = data.aws_ssm_parameter.ubuntu_ami.value
  instance_type               = "t3.large"
  key_name                    = var.key_name
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.jenkins.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 60
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tags = {
    Name = "logistics-jenkins-server"
    Role = "Jenkins-DevSecOps"
  }
}