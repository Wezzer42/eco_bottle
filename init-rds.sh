#!/bin/bash

# Initialize AWS RDS database for EcoBottle
set -e

RDS_ENDPOINT="your-rds-endpoint.amazonaws.com"
RDS_PORT="5432"
RDS_DB="ecobottle"
RDS_USER="ecobottle"

echo "🗄️ Initializing AWS RDS PostgreSQL database"

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

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL client (psql) is not installed!"
    echo "Install it with:"
    echo "  Ubuntu/Debian: sudo apt install postgresql-client"
    echo "  macOS: brew install postgresql"
    exit 1
fi

# Set RDS password
RDS_PASSWORD="your_secure_password"

echo "RDS Configuration:"
echo "  Endpoint: $RDS_ENDPOINT"
echo "  Port: $RDS_PORT"
echo "  Database: $RDS_DB"
echo "  Username: $RDS_USER"
echo "  Password: ******* (from config)"
echo ""

# Test connection
print_status "Testing RDS connection..."
if PGPASSWORD="$RDS_PASSWORD" psql -h "$RDS_ENDPOINT" -p "$RDS_PORT" -U "$RDS_USER" -d "$RDS_DB" -c "SELECT 1;" > /dev/null 2>&1; then
    print_status "✅ RDS connection successful!"
else
    print_error "❌ Failed to connect to RDS! Please check:"
    echo "  1. RDS security group allows connections from your IP"
    echo "  2. Username and password are correct"
    echo "  3. Database exists and user has permissions"
    exit 1
fi

# Run Prisma migrations
print_status "Setting up database schema with Prisma..."

# Create temporary DATABASE_URL
export DATABASE_URL="postgresql://$RDS_USER:$RDS_PASSWORD@$RDS_ENDPOINT:$RDS_PORT/$RDS_DB"

# Check if we're in the right directory
if [ ! -f "backend/prisma/schema.prisma" ]; then
    print_error "Please run this script from the project root directory!"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    print_status "Installing backend dependencies..."
    cd backend && npm ci && cd ..
fi

# Run Prisma commands
print_status "Generating Prisma client..."
cd backend && npx prisma generate

print_status "Applying database migrations..."
npx prisma migrate deploy

print_status "Seeding database with initial data..."
npx prisma db seed || print_warning "Seeding failed or no seed script found"

cd ..

# Verify database setup
print_status "Verifying database setup..."
PGPASSWORD="$RDS_PASSWORD" psql -h "$RDS_ENDPOINT" -p "$RDS_PORT" -U "$RDS_USER" -d "$RDS_DB" -c "
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
" | grep -E "(User|Product|Wishlist|Account|Waitlist)" && print_status "✅ Database tables created successfully!"

print_status "🎉 RDS database initialization completed!"
print_status "Database URL: postgresql://$RDS_USER:***@$RDS_ENDPOINT:$RDS_PORT/$RDS_DB"

print_warning "Security reminder:"
echo "  1. Ensure RDS security group only allows necessary IPs"
echo "  2. Consider using AWS Secrets Manager for password storage"
echo "  3. Enable RDS encryption at rest if not already enabled"
echo "  4. Set up automated backups and monitoring"
