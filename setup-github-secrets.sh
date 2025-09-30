#!/bin/bash

# GitHub Secrets Setup Script for EcoBottle
set -e

echo "🔐 Setting up GitHub Secrets for EcoBottle deployment"

# ⚠️ SECURITY WARNING
echo ""
echo "⚠️  SECURITY NOTICE:"
echo "   - This script will prompt for sensitive information"
echo "   - All secrets are transmitted securely to GitHub"
echo "   - Never share generated secrets in plain text"
echo "   - Use this script only on trusted machines"
echo ""
read -p "Continue with secrets setup? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Setup cancelled by user"
    exit 0
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed!"
    echo ""
    echo "Install it from: https://cli.github.com/"
    echo "Or with brew: brew install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    print_error "GitHub CLI is not authenticated!"
    echo ""
    echo "Run: gh auth login"
    exit 1
fi

# Get repository info
REPO_OWNER=$(gh repo view --json owner --jq .owner.login)
REPO_NAME=$(gh repo view --json name --jq .name)

print_status "Repository: $REPO_OWNER/$REPO_NAME"

echo ""
print_header "🔑 Generating Secrets"

# Generate JWT Secret
JWT_SECRET=$(openssl rand -hex 32)
print_status "Generated JWT_SECRET (64 chars)"

# Generate NextAuth Secret
NEXTAUTH_SECRET=$(openssl rand -hex 16)
print_status "Generated NEXTAUTH_SECRET (32 chars)"

# Generate Grafana Password
GRAFANA_PASSWORD="EcoBotProd$(date +%Y%m)$(openssl rand -hex 4)"
print_status "Generated GRAFANA_PASSWORD"

# Generate backup encryption key
BACKUP_ENCRYPTION_KEY=$(openssl rand -hex 32)
print_status "Generated BACKUP_ENCRYPTION_KEY"

echo ""
print_header "📝 Repository Secrets Setup"

# Set repository secrets
print_status "Setting repository secrets..."

echo "$JWT_SECRET" | gh secret set JWT_SECRET
echo "$NEXTAUTH_SECRET" | gh secret set NEXTAUTH_SECRET

# SSH Private Key setup
echo ""
print_warning "SSH Private Key Setup Required"
echo "1. Make sure you have SSH access to your EC2 instance"
echo "2. Your private key should be at ~/.ssh/your-key.pem"
echo ""
read -p "Enter path to your SSH private key [~/.ssh/id_rsa]: " SSH_KEY_PATH
SSH_KEY_PATH=${SSH_KEY_PATH:-~/.ssh/id_rsa}

if [[ -f "$SSH_KEY_PATH" ]]; then
    gh secret set SSH_PRIVATE_KEY < "$SSH_KEY_PATH"
    print_status "SSH_PRIVATE_KEY set successfully"
else
    print_error "SSH key not found at: $SSH_KEY_PATH"
    echo "Please run this script again with the correct path"
    exit 1
fi

echo ""
print_header "🌍 Environment Setup"

# Production environment
print_status "Setting up production environment..."

# Create production environment if it doesn't exist
gh api repos/$REPO_OWNER/$REPO_NAME/environments/production --silent 2>/dev/null || \
    gh api repos/$REPO_OWNER/$REPO_NAME/environments -f name=production

# Set production secrets
echo ""
print_warning "⚠️  MANUAL INPUT REQUIRED FOR PRODUCTION SECRETS"
echo ""

# Database URL
read -s -p "Enter DATABASE_URL for production: " PROD_DATABASE_URL
echo
echo "$PROD_DATABASE_URL" | gh secret set DATABASE_URL --env production

# Database Password
read -s -p "Enter DB_PASSWORD for production: " PROD_DB_PASSWORD
echo
echo "$PROD_DB_PASSWORD" | gh secret set DB_PASSWORD --env production

# Redis URL
read -s -p "Enter REDIS_URL for production: " PROD_REDIS_URL
echo
echo "$PROD_REDIS_URL" | gh secret set REDIS_URL --env production

echo "$GRAFANA_PASSWORD" | gh secret set GRAFANA_PASSWORD --env production

echo "$BACKUP_ENCRYPTION_KEY" | gh secret set BACKUP_ENCRYPTION_KEY --env production

# Set production variables
echo ""
read -p "Enter EC2_HOST for production [ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com]: " PROD_EC2_HOST
PROD_EC2_HOST=${PROD_EC2_HOST:-ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com}

gh variable set EC2_HOST --env production --body "$PROD_EC2_HOST"
gh variable set EC2_USER --env production --body "ubuntu"
gh variable set NEXTAUTH_URL --env production --body "http://$PROD_EC2_HOST"
gh variable set NEXT_PUBLIC_API_BASE --env production --body "http://$PROD_EC2_HOST/api"
gh variable set CORS_ORIGIN --env production --body "http://$PROD_EC2_HOST"
gh variable set AWS_REGION --env production --body "ap-northeast-2"
gh variable set GRAFANA_USER --env production --body "admin"

print_status "Production environment configured"

# Staging environment
print_status "Setting up staging environment..."

# Create staging environment
gh api repos/$REPO_OWNER/$REPO_NAME/environments/staging --silent 2>/dev/null || \
    gh api repos/$REPO_OWNER/$REPO_NAME/environments -f name=staging

# Generate staging-specific secrets
STAGING_JWT_SECRET=$(openssl rand -hex 32)
STAGING_NEXTAUTH_SECRET=$(openssl rand -hex 16)
STAGING_GRAFANA_PASSWORD="StagingPass$(date +%Y%m)$(openssl rand -hex 4)"

echo "$STAGING_JWT_SECRET" | gh secret set STAGING_JWT_SECRET --env staging
echo "$STAGING_NEXTAUTH_SECRET" | gh secret set STAGING_NEXTAUTH_SECRET --env staging
echo "$STAGING_GRAFANA_PASSWORD" | gh secret set STAGING_GRAFANA_PASSWORD --env staging

# Set staging variables
echo ""
read -p "Enter EC2_HOST for staging [same as production]: " STAGING_EC2_HOST
STAGING_EC2_HOST=${STAGING_EC2_HOST:-$PROD_EC2_HOST}

gh variable set EC2_HOST --env staging --body "$STAGING_EC2_HOST"
gh variable set EC2_USER --env staging --body "ubuntu"
gh variable set STAGING_NEXTAUTH_URL --env staging --body "http://staging.$STAGING_EC2_HOST"
gh variable set STAGING_NEXT_PUBLIC_API_BASE --env staging --body "http://staging.$STAGING_EC2_HOST/api"
gh variable set STAGING_CORS_ORIGIN --env staging --body "http://staging.$STAGING_EC2_HOST"

print_status "Staging environment configured"

echo ""
print_header "🎉 Setup Complete!"

echo ""
echo "📋 Summary of configured secrets:"
echo "  ✅ Repository secrets: JWT_SECRET, NEXTAUTH_SECRET, SSH_PRIVATE_KEY"
echo "  ✅ Production environment: DATABASE_URL, REDIS_URL, etc."
echo "  ✅ Staging environment: Staging-specific secrets"
echo ""
echo "🔐 Generated secrets:"
echo "  JWT_SECRET: ******* (64 chars)"
echo "  NEXTAUTH_SECRET: ******* (32 chars)"
echo "  GRAFANA_PASSWORD: ******* (generated)"
echo ""
print_warning "📝 TODO: Manual setup required for:"
echo "  1. Google OAuth credentials (if using)"
echo "  2. AWS access keys (if using AWS services beyond RDS/ElastiCache)"
echo "  3. Slack/Discord webhook URLs (for notifications)"
echo "  4. SSL certificate email (for Let's Encrypt)"
echo ""
echo "🚀 Next steps:"
echo "  1. Go to GitHub Actions → Deploy EcoBottle"
echo "  2. Select environment (staging/production)"
echo "  3. Run the deployment workflow"
echo ""
echo "📖 For detailed setup guide, see: SECRETS-SETUP.md"

echo ""
print_warning "🧹 Cleaning up sensitive variables from memory..."
unset JWT_SECRET NEXTAUTH_SECRET GRAFANA_PASSWORD BACKUP_ENCRYPTION_KEY
unset STAGING_JWT_SECRET STAGING_NEXTAUTH_SECRET STAGING_GRAFANA_PASSWORD
unset PROD_DATABASE_URL PROD_DB_PASSWORD PROD_REDIS_URL
echo "✅ Memory cleanup completed"
