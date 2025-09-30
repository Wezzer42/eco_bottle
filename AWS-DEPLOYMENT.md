# 🚀 AWS EC2 Deployment Guide

## Prerequisites

- AWS Account
- Domain name (optional, can use IP)
- SSH key pair

## Step 1: Launch EC2 Instance

### Instance Configuration:
- **AMI**: Ubuntu Server 22.04 LTS
- **Instance Type**: t3.medium (2 vCPU, 4GB RAM) - minimum for our stack
- **Storage**: 20GB SSD (gp3)
- **Security Group**:
  - SSH (22) - Your IP only
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0
  - Custom TCP (3001) - Your IP only (Grafana)
  - Custom TCP (9090) - Your IP only (Prometheus)

### Launch Command (AWS CLI):
```bash
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-groups eco-bottle-sg \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":20,"VolumeType":"gp3"}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=EcoBottle-Production}]'
```

## Step 2: Connect to Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Install Node.js (for SSL setup)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Certbot for SSL
sudo apt install certbot -y
```

## Step 4: Clone and Configure Project

```bash
# Clone repository
git clone https://github.com/Wezzer42/eco_bottle.git
cd eco_bottle

# Create production environment
cp .env.prod.example .env.prod
nano .env.prod  # Configure your values

# Generate secure secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Configure Domain (Optional)

If you have a domain:

1. **Point domain to EC2 IP:**
   ```
   A record: your-domain.com -> EC2_PUBLIC_IP
   ```

2. **Update nginx configuration:**
   ```bash
   nano nginx/nginx.conf
   # Replace 'your-domain.com' with your actual domain
   ```

3. **Get SSL certificate:**
   ```bash
   sudo certbot certonly --standalone -d your-domain.com
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
   sudo chown ubuntu:ubuntu nginx/ssl/*
   ```

## Step 6: Deploy Application

```bash
# Deploy
./deploy.sh

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Step 7: Configure Firewall (UFW)

```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow from YOUR_IP to any port 3001  # Grafana
sudo ufw allow from YOUR_IP to any port 9090  # Prometheus
```

## Step 8: Setup Monitoring Alerts

1. **Configure Grafana:**
   - Open https://your-domain.com/grafana
   - Login: admin/admin (change immediately!)
   - Import dashboards from `monitoring/grafana/dashboards/`

2. **Configure Prometheus alerts:**
   - Check rules in `monitoring/prometheus/rules/`
   - Setup AlertManager for notifications

## Step 9: Setup Automated Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec eco-postgres pg_dump -U ecobottle ecobottle > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
rm backup_$DATE.sql
EOF

chmod +x backup.sh

# Add to crontab (daily backup at 2 AM)
echo "0 2 * * * /home/ubuntu/eco_bottle/backup.sh" | crontab -
```

## Step 10: Production Checklist

### Security:
- [ ] Change default monitoring passwords
- [ ] Setup proper SSL certificates
- [ ] Configure firewall rules
- [ ] Enable fail2ban for SSH protection
- [ ] Regular security updates

### Monitoring:
- [ ] Configure email alerts
- [ ] Setup log rotation
- [ ] Monitor disk usage
- [ ] Setup uptime monitoring

### Performance:
- [ ] Enable CloudWatch monitoring
- [ ] Setup CloudFront CDN
- [ ] Configure auto-scaling (if needed)
- [ ] Optimize database queries

### Backup:
- [ ] Database backups to S3
- [ ] Application code backups
- [ ] SSL certificate backups
- [ ] Test restore procedures

## Troubleshooting

### Common Issues:

1. **Services not starting:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs
   ```

2. **SSL certificate issues:**
   ```bash
   # Check certificate
   openssl x509 -in nginx/ssl/fullchain.pem -text -noout
   ```

3. **Database connection issues:**
   ```bash
   docker exec -it eco-postgres psql -U ecobottle -d ecobottle
   ```

4. **Memory issues:**
   ```bash
   # Check memory usage
   free -h
   docker stats
   ```

## Scaling Considerations

For higher traffic:
- Use AWS ALB + multiple EC2 instances
- RDS for managed database
- ElastiCache for managed Redis
- CloudFront CDN
- Auto Scaling Groups

## Cost Optimization

- Use t3.small for low traffic
- Setup CloudWatch alarms for cost monitoring
- Use AWS Reserved Instances for long-term savings
- Implement log rotation to save storage
