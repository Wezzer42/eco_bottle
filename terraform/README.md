# 🚀 AWS Infrastructure Deployment

## Architecture Overview

```
Internet → ALB (HTTPS) → EC2 Instances → RDS PostgreSQL
                      └→ ElastiCache Redis
```

## Infrastructure Components

- **Application Load Balancer**: HTTPS termination, path-based routing
- **Auto Scaling Group**: 1-3 EC2 instances with health checks
- **RDS PostgreSQL**: Managed database with backups
- **ElastiCache Redis**: Managed cache with clustering
- **VPC**: Private subnets for databases, public for ALB
- **SSL Certificate**: Free AWS ACM certificate with auto-renewal

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Domain name** pointing to AWS
3. **AWS CLI** configured
4. **Terraform** installed (>= 1.0)
5. **SSH Key Pair** created in AWS

## Quick Start

### 1. Install Terraform

```bash
# macOS
brew install terraform

# Ubuntu/Debian
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

### 2. Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID, Secret, Region (us-east-1), and output format (json)
```

### 3. Create SSH Key Pair

```bash
aws ec2 create-key-pair --key-name ecobottle-key --query 'KeyMaterial' --output text > ecobottle-key.pem
chmod 400 ecobottle-key.pem
```

### 4. Configure Variables

```bash
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars
```

**Required changes:**
- `domain_name`: Your actual domain
- `admin_cidr`: Your IP address (for security)
- `key_pair_name`: "ecobottle-key"
- `db_password`: Secure password for PostgreSQL
- `redis_auth_token`: Secure token for Redis
- `jwt_secret`: 64-character random string
- `nextauth_secret`: 32-character random string

### 5. Generate Secrets

```bash
# JWT Secret (64 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# NextAuth Secret (32 chars)  
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Redis Auth Token (32 chars)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 6. Deploy Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Deploy (takes ~10-15 minutes)
terraform apply
```

### 7. DNS Configuration

After deployment, you'll get the ALB DNS name. Create a CNAME record:

```
your-domain.com CNAME your-alb-dns-name.us-east-1.elb.amazonaws.com
```

### 8. SSL Certificate Validation

Terraform will output DNS validation records. Add them to your domain:

```bash
# Check certificate status
aws acm describe-certificate --certificate-arn YOUR_CERT_ARN
```

## Post-Deployment

### Verify Services

```bash
# Health checks
curl https://your-domain.com/health
curl https://your-domain.com/api/health

# Monitoring
open https://your-domain.com/grafana  # admin/admin123
open https://your-domain.com/prometheus
```

### SSH to Instances

```bash
# Get instance IPs
aws ec2 describe-instances --filters "Name=tag:Name,Values=ecobottle-instance" --query 'Reservations[].Instances[].PublicIpAddress'

# SSH
ssh -i ecobottle-key.pem ubuntu@INSTANCE_IP
```

### Application Logs

```bash
# Container logs
docker-compose -f /opt/ecobottle/docker-compose.prod.yml -f /opt/ecobottle/docker-compose.aws.yml logs -f

# Application logs
tail -f /var/log/ecobottle-health.log

# CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix ecobottle
```

## Scaling

### Manual Scaling

```bash
# Update desired capacity
aws autoscaling update-auto-scaling-group --auto-scaling-group-name ecobottle-asg --desired-capacity 3
```

### Auto Scaling Policies

```bash
# CPU-based scaling
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name ecobottle-asg \
  --policy-name scale-up \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration file://scaling-policy.json
```

## Monitoring & Alerts

### CloudWatch Dashboards

- **Infrastructure**: EC2, RDS, ElastiCache metrics
- **Application**: Custom metrics from Prometheus
- **Logs**: Centralized logging with search

### Recommended Alerts

- High CPU usage (>80%)
- High memory usage (>85%)
- Database connections (>80% of max)
- HTTP error rate (>5%)
- Response time (>2s average)

## Backup Strategy

### Automated Backups

- **RDS**: 7-day automated backups
- **Application**: Daily snapshots of EBS volumes
- **Configuration**: Store Terraform state in S3 with versioning

### Manual Backup

```bash
# Database backup
aws rds create-db-snapshot --db-instance-identifier ecobottle-db --db-snapshot-identifier ecobottle-manual-backup-$(date +%Y%m%d)

# EBS snapshots
aws ec2 create-snapshot --volume-id vol-xxxxxxxx --description "EcoBottle manual backup $(date)"
```

## Security Hardening

### Network Security

- VPC with private subnets for databases
- Security groups with minimal required access
- ALB terminating SSL/TLS
- WAF rules for common attacks (optional)

### Application Security

- Secrets stored in AWS Systems Manager Parameter Store
- Regular security updates via unattended-upgrades
- Container image scanning
- HTTPS enforcement

### Access Control

- IAM roles with minimal permissions
- SSH access restricted to admin IP
- Database access only from application instances
- Monitoring endpoints password-protected

## Cost Optimization

### Current Costs (Monthly estimates)

- **EC2 (t3.medium × 2)**: ~$60
- **RDS (db.t3.micro)**: ~$15  
- **ElastiCache (cache.t3.micro)**: ~$15
- **ALB**: ~$20
- **Data Transfer**: ~$10
- **Total**: ~$120/month

### Optimization Tips

- Use Spot Instances for dev/staging
- Enable RDS storage encryption
- Set up automated resource cleanup
- Use CloudWatch billing alerts
- Consider Reserved Instances for production

## Troubleshooting

### Common Issues

1. **Certificate validation fails**
   ```bash
   # Check DNS records
   dig your-domain.com
   # Verify in Route 53 or your DNS provider
   ```

2. **Instances not healthy**
   ```bash
   # Check user data logs
   ssh -i ecobottle-key.pem ubuntu@INSTANCE_IP
   sudo tail -f /var/log/cloud-init-output.log
   ```

3. **Database connection fails**
   ```bash
   # Check security groups
   aws ec2 describe-security-groups --group-ids sg-xxxxxxxx
   ```

4. **Application not responding**
   ```bash
   # Restart services
   sudo systemctl restart ecobottle.service
   ```

### Debugging Commands

```bash
# Check Terraform state
terraform show

# Validate configuration
terraform validate

# Check AWS resources
aws elbv2 describe-load-balancers
aws rds describe-db-instances
aws elasticache describe-replication-groups
```

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will delete ALL data including databases. Make sure to backup first!

## Support

For issues:
1. Check CloudWatch logs
2. Review Terraform state
3. Verify AWS service limits
4. Check security group rules
5. Monitor application health checks
