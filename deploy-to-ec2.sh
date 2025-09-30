#!/bin/bash

# Quick deployment to existing EC2 instance
set -e

EC2_HOST="ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com"
EC2_USER="ubuntu"
KEY_FILE="your-key.pem"  # Update this path

echo "🚀 Deploying EcoBottle to EC2 instance: $EC2_HOST"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    print_warning "SSH key file not found. Please update KEY_FILE in this script."
    echo "Example: KEY_FILE=\"~/.ssh/your-ec2-key.pem\""
    exit 1
fi

# Set RDS password
RDS_PASSWORD="Touhou13"
print_status "Using AWS RDS PostgreSQL and ElastiCache Redis..."

print_status "Setting up EC2 instance dependencies..."

# Install Docker and dependencies on EC2
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install Git and other tools
sudo apt install -y git htop curl wget unzip nginx certbot python3-certbot-nginx

echo "Dependencies installed successfully!"
ENDSSH

print_status "Copying application files..."

# Create temporary directory for transfer
TEMP_DIR="/tmp/ecobottle-deploy"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy necessary files
cp -r . "$TEMP_DIR/"
cd "$TEMP_DIR"

# Remove .git to reduce transfer size
rm -rf .git node_modules */node_modules

# Transfer files to EC2
rsync -avz -e "ssh -i $KEY_FILE" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='*/node_modules' \
    --exclude='*.log' \
    ./ "$EC2_USER@$EC2_HOST:/home/ubuntu/ecobottle/"

print_status "Setting up application on EC2..."

# Setup application on EC2
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" << ENDSSH
cd /home/ubuntu/ecobottle

# Create production environment file with AWS services
cat > .env.prod << EOF
# AWS RDS PostgreSQL
DATABASE_URL=postgresql://ecobottle:$RDS_PASSWORD@ecobottle.c5a0ccyi8zva.ap-northeast-2.rds.amazonaws.com:5432/ecobottle

# AWS ElastiCache Serverless Redis
REDIS_URL=rediss://ecobottle.cache.amazonaws.com:6379

# URLs
NEXTAUTH_URL=http://ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com
NEXT_PUBLIC_API_BASE=http://ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com/api
CORS_ORIGIN=http://ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com

# Environment
NODE_ENV=production
PORT=4000
PROM_PORT=9100

# AWS Region
AWS_REGION=ap-northeast-2

# Monitoring
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin123

# Security (will be generated below)
JWT_SECRET=placeholder
NEXTAUTH_SECRET=placeholder
EOF

# Generate secure secrets
echo "Generating secure secrets..."
JWT_SECRET=$(openssl rand -hex 32)
NEXTAUTH_SECRET=$(openssl rand -hex 16)

# Update environment file with generated secrets
sed -i "s/your_jwt_secret_64_characters_minimum_for_production_security_replace_this/$JWT_SECRET/" .env.prod
sed -i "s/your_nextauth_secret_32_characters_minimum_secure_replace/$NEXTAUTH_SECRET/" .env.prod

echo "Generated secrets:"
echo "JWT_SECRET: $JWT_SECRET"
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

# Set proper permissions
chmod 600 .env.prod

# Stop any existing containers
docker-compose -f docker-compose.simple.yml -f docker-compose.aws.yml down || true

# Build and start services with AWS overrides
echo "Building and starting services with AWS ElastiCache..."
docker-compose -f docker-compose.simple.yml -f docker-compose.aws.yml up --build -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 45

# Check service health
echo "Checking service health..."
docker-compose -f docker-compose.simple.yml -f docker-compose.aws.yml ps

# Show logs
echo "Recent logs:"
docker-compose -f docker-compose.simple.yml -f docker-compose.aws.yml logs --tail=10

echo "🎉 Deployment completed!"
ENDSSH

print_status "Testing deployment..."

# Test the deployment
echo "Testing application endpoints..."

# Test backend health
if curl -sf "http://$EC2_HOST/health" > /dev/null; then
    print_status "✅ Backend health check passed"
else
    print_warning "❌ Backend health check failed"
fi

# Test frontend
if curl -sf "http://$EC2_HOST" > /dev/null; then
    print_status "✅ Frontend check passed"
else
    print_warning "❌ Frontend check failed"
fi

print_status "🎉 Deployment completed!"
echo ""
echo "🌐 Application URLs:"
echo "  Frontend: http://$EC2_HOST"
echo "  API: http://$EC2_HOST/api"
echo "  Health: http://$EC2_HOST/health"
echo "  Grafana: http://$EC2_HOST:3001 (admin/admin123)"
echo "  Prometheus: http://$EC2_HOST:9090"
echo ""
echo "📝 Next steps:"
echo "  1. Configure your domain to point to this IP"
echo "  2. Setup SSL with Let's Encrypt"
echo "  3. Configure firewall rules"
echo "  4. Change default monitoring passwords"
echo ""
echo "🔧 To manage the application:"
echo "  ssh -i $KEY_FILE $EC2_USER@$EC2_HOST"
echo "  cd /home/ubuntu/ecobottle"
echo "  docker-compose -f docker-compose.simple.yml -f docker-compose.aws.yml logs -f"

# Cleanup
cd /
rm -rf "$TEMP_DIR"
