output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_id" {
  value = aws_subnet.public.id
}

output "k8s_nodes" {
  description = "K8s EC2 node information"

  value = {
    for name, instance in aws_instance.k8s_nodes : name => {
      instance_id = instance.id
      public_ip   = instance.public_ip
      private_ip  = instance.private_ip
    }
  }
}
