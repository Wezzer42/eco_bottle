#!/bin/bash

# EcoBottle AWS EC2 Deployment Script
set -e

echo "🚀 Starting EcoBottle deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    print_error ".env.prod file not found. Please copy .env.prod.example to .env.prod and configure it."
    exit 1
fi

print_status "Environment file found ✓"

# Load environment variables
set -a
source .env.prod
set +a

# Create SSL directory
mkdir -p nginx/ssl

# Generate self-signed SSL certificate if not exists (for testing)
if [ ! -f nginx/ssl/fullchain.pem ]; then
    print_warning "SSL certificates not found. Generating self-signed certificates for testing..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/privkey.pem \
        -out nginx/ssl/fullchain.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    print_status "Self-signed SSL certificates generated ✓"
fi

# Create htpasswd file for monitoring access
if [ ! -f nginx/.htpasswd ]; then
    print_status "Creating monitoring authentication..."
    echo "admin:\$apr1\$ruca84Hq\$mbjdMZBAG.KWn7vfN/SNK/" > nginx/.htpasswd
    print_status "Monitoring auth created (admin/admin) - CHANGE THIS IN PRODUCTION! ✓"
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true

# Remove old images (optional)
if [ "$1" = "--clean" ]; then
    print_status "Cleaning old Docker images..."
    docker system prune -f
    docker image prune -f
fi

# Build and start services
print_status "Building and starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check backend health
if curl -sf http://localhost/health > /dev/null; then
    print_status "Backend health check ✓"
else
    print_error "Backend health check failed ✗"
fi

# Check frontend
if curl -sf http://localhost > /dev/null; then
    print_status "Frontend health check ✓"
else
    print_error "Frontend health check failed ✗"
fi

# Show container status
print_status "Container status:"
docker-compose -f docker-compose.prod.yml ps

# Show logs
print_status "Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

print_status "🎉 Deployment completed!"
print_status "Services available at:"
echo "  📱 Frontend: https://your-domain.com"
echo "  🔧 API: https://your-domain.com/api"
echo "  📊 Grafana: https://your-domain.com/grafana (admin/admin)"
echo "  📈 Prometheus: https://your-domain.com/prometheus"

print_warning "Remember to:"
echo "  1. Configure your domain in nginx/nginx.conf"
echo "  2. Get real SSL certificates with Let's Encrypt"
echo "  3. Change default monitoring passwords"
echo "  4. Configure firewall rules"
echo "  5. Set up automated backups"
