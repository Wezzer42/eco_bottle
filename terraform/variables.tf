# General
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "ecobottle"
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "admin_cidr" {
  description = "CIDR block for admin access"
  type        = string
  default     = "0.0.0.0/0"  # Change this to your IP for security
}

# EC2
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "key_pair_name" {
  description = "EC2 Key Pair name"
  type        = string
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 3
}

variable "desired_instances" {
  description = "Desired number of instances"
  type        = number
  default     = 2
}

# Database
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "ecobottle"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "ecobottle"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Redis
variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_auth_token" {
  description = "Redis AUTH token"
  type        = string
  sensitive   = true
}

# Application Secrets
variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NextAuth secret"
  type        = string
  sensitive   = true
}
