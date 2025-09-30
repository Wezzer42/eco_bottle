#!/bin/bash

# EcoBottle EC2 Instance Bootstrap Script
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git and other tools
apt-get install -y git htop curl wget unzip

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ./amazon-cloudwatch-agent.deb

# Create application directory
mkdir -p /opt/ecobottle
cd /opt/ecobottle

# Clone application (you'll need to set up deployment keys)
git clone https://github.com/Wezzer42/eco_bottle.git .

# Create production environment file
cat > .env.prod << EOF
# Database
DATABASE_URL=postgresql://${db_username}:${db_password}@${db_host}:5432/${db_name}

# Redis (with auth)
REDIS_URL=rediss://default:${redis_auth}@${redis_host}:6379

# Security
JWT_SECRET=${jwt_secret}
NEXTAUTH_SECRET=${nextauth_secret}

# URLs
NEXTAUTH_URL=https://${domain_name}
NEXT_PUBLIC_API_BASE=https://${domain_name}/api
CORS_ORIGIN=https://${domain_name}

# Environment
NODE_ENV=production
PORT=4000
PROM_PORT=9100

# Monitoring
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin123
EOF

# Set proper permissions
chown -R ubuntu:ubuntu /opt/ecobottle
chmod 600 .env.prod

# Create docker-compose override for AWS
cat > docker-compose.aws.yml << EOF
version: '3.8'

services:
  backend:
    environment:
      - DATABASE_URL=postgresql://${db_username}:${db_password}@${db_host}:5432/${db_name}
      - REDIS_URL=rediss://default:${redis_auth}@${redis_host}:6379
    
  frontend:
    environment:
      - NEXTAUTH_URL=https://${domain_name}
      - NEXT_PUBLIC_API_BASE=https://${domain_name}/api

  # Remove local postgres and redis - we're using AWS managed services
  postgres:
    image: alpine:latest
    command: echo "Using AWS RDS"
    
  redis:
    image: alpine:latest  
    command: echo "Using AWS ElastiCache"
EOF

# Create systemd service for auto-start
cat > /etc/systemd/system/ecobottle.service << EOF
[Unit]
Description=EcoBottle Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/ecobottle
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml -f docker-compose.aws.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml -f docker-compose.aws.yml down
TimeoutStartSec=0
User=ubuntu

[Install]
WantedBy=multi-user.target
EOF

# Enable service
systemctl enable ecobottle.service

# Start application
systemctl start ecobottle.service

# Install CloudWatch agent config
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
  "metrics": {
    "namespace": "EcoBottle/EC2",
    "metrics_collected": {
      "cpu": {
        "measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": ["used_percent"],
        "metrics_collection_interval": 60,
        "resources": ["*"]
      },
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60
      },
      "netstat": {
        "measurement": ["tcp_established", "tcp_time_wait"],
        "metrics_collection_interval": 60
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/opt/ecobottle/logs/*.log",
            "log_group_name": "ecobottle-application",
            "log_stream_name": "{instance_id}/application"
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "ecobottle-nginx",
            "log_stream_name": "{instance_id}/access"
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "ecobottle-nginx", 
            "log_stream_name": "{instance_id}/error"
          }
        ]
      }
    }
  }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s

# Setup log rotation
cat > /etc/logrotate.d/ecobottle << EOF
/opt/ecobottle/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF

# Create health check script
cat > /opt/ecobottle/health-check.sh << 'EOF'
#!/bin/bash
# Health check script for EcoBottle

# Check if containers are running
if ! docker-compose -f /opt/ecobottle/docker-compose.prod.yml -f /opt/ecobottle/docker-compose.aws.yml ps | grep -q "Up"; then
    echo "Containers not running, attempting restart..."
    systemctl restart ecobottle.service
    exit 1
fi

# Check application health
if ! curl -sf http://localhost:4000/api/health > /dev/null; then
    echo "Backend health check failed"
    exit 1
fi

if ! curl -sf http://localhost:3000 > /dev/null; then
    echo "Frontend health check failed"
    exit 1
fi

echo "All services healthy"
exit 0
EOF

chmod +x /opt/ecobottle/health-check.sh

# Add health check to cron (every 5 minutes)
echo "*/5 * * * * ubuntu /opt/ecobottle/health-check.sh >> /var/log/ecobottle-health.log 2>&1" | crontab -

# Setup automatic security updates
echo 'Unattended-Upgrade::Automatic-Reboot "false";' >> /etc/apt/apt.conf.d/50unattended-upgrades
systemctl enable unattended-upgrades

echo "EcoBottle bootstrap completed successfully!"
