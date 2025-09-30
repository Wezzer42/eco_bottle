# 🔐 Secrets Management Guide

## Required GitHub Secrets

### Repository Secrets (all environments)

#### SSH Access
- `SSH_PRIVATE_KEY` - Your EC2 SSH private key content

#### Core Secrets
- `JWT_SECRET` - JWT signing secret (64 chars)
- `NEXTAUTH_SECRET` - NextAuth signing secret (32 chars)

### Environment-Specific Secrets

#### Production Environment
```
# Database
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/database
DB_PASSWORD=your_secure_password

# Cache
REDIS_URL=rediss://your-elasticache-endpoint:6379
REDIS_AUTH_TOKEN=your_redis_auth_token

# OAuth
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret

# Monitoring
GRAFANA_PASSWORD=EcoBotProd2024!

# AWS
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Backup
BACKUP_S3_BUCKET=ecobottle-prod-backups
BACKUP_ENCRYPTION_KEY=your_backup_encryption_key

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# SSL
SSL_CERT_EMAIL=admin@yourdomain.com
```

#### Staging Environment
```
# Database
STAGING_DATABASE_URL=postgresql://staging_user:staging_pass@staging-db:5432/ecobottle_staging
STAGING_DB_PASSWORD=staging_pass

# Cache
STAGING_REDIS_URL=redis://staging-redis:6379

# Security
STAGING_JWT_SECRET=staging_jwt_secret_different_from_prod
STAGING_NEXTAUTH_SECRET=staging_nextauth_secret

# OAuth
STAGING_GOOGLE_CLIENT_ID=staging_google_client_id
STAGING_GOOGLE_CLIENT_SECRET=staging_google_client_secret

# Monitoring
STAGING_GRAFANA_PASSWORD=StagingPass123!
```

### Environment Variables (public)

#### Production
```
EC2_HOST=ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com
EC2_USER=ubuntu
NEXTAUTH_URL=http://ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com
NEXT_PUBLIC_API_BASE=http://ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com/api
CORS_ORIGIN=http://ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com
AWS_REGION=ap-northeast-2
GRAFANA_USER=admin
```

#### Staging
```
EC2_HOST=staging.yourdomain.com
EC2_USER=ubuntu
STAGING_NEXTAUTH_URL=http://staging.yourdomain.com
STAGING_NEXT_PUBLIC_API_BASE=http://staging.yourdomain.com/api
STAGING_CORS_ORIGIN=http://staging.yourdomain.com
AWS_REGION=ap-northeast-2
```

## Setup Instructions

### 1. Generate Secrets

```bash
# JWT Secret (64 chars)
openssl rand -hex 32

# NextAuth Secret (32 chars)
openssl rand -hex 16

# Random passwords
openssl rand -base64 32

# Backup encryption key
openssl rand -hex 32
```

### 2. Configure GitHub Repository

#### Go to Settings → Secrets and Variables → Actions

**Repository Secrets:**
- Add `SSH_PRIVATE_KEY` with your EC2 private key content

**Environment Secrets:**

For each environment (production, staging):
1. Create environment if it doesn't exist
2. Add all environment-specific secrets
3. Add environment variables

### 3. Setup SSH Key

```bash
# Create or use existing key
ssh-keygen -t rsa -b 4096 -C "deployment@ecobottle"

# Add public key to EC2 instance
ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com

# Copy private key content for GitHub secret
cat ~/.ssh/id_rsa
```

### 4. Configure AWS Access

```bash
# Create IAM user for deployment
aws iam create-user --user-name ecobottle-deployment

# Attach necessary policies
aws iam attach-user-policy \
  --user-name ecobottle-deployment \
  --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess

aws iam attach-user-policy \
  --user-name ecobottle-deployment \
  --policy-arn arn:aws:iam::aws:policy/AmazonElastiCacheFullAccess

# Create access keys
aws iam create-access-key --user-name ecobottle-deployment
```

## Security Best Practices

### 1. Secret Rotation

Run secret rotation monthly:
```bash
# Go to Actions → Setup Deployment Secrets
# Select environment → Check "Rotate security secrets"
```

### 2. Access Control

- Limit GitHub repository access
- Use branch protection rules
- Require reviews for production deployments
- Enable two-factor authentication

### 3. Monitoring

- Monitor for unauthorized access
- Set up alerts for secret changes
- Audit secret usage regularly
- Use AWS CloudTrail for API monitoring

### 4. Backup Strategy

- Store encrypted backups of secrets
- Use AWS Secrets Manager for critical secrets
- Maintain offline backup of SSH keys
- Document recovery procedures

## Troubleshooting

### SSH Connection Issues
```bash
# Test SSH connection
ssh -i ~/.ssh/deploy_key ubuntu@your-ec2-host

# Check key permissions
chmod 600 ~/.ssh/deploy_key

# Verify key is correct
ssh-keygen -l -f ~/.ssh/deploy_key
```

### Secret Validation Errors
```bash
# Check if secrets exist on server
ssh ubuntu@your-ec2-host "ls -la /etc/ecobottle/secrets/"

# Validate secret format
ssh ubuntu@your-ec2-host "grep JWT_SECRET /etc/ecobottle/secrets/secrets.env"
```

### Database Connection Issues
```bash
# Test database connection
PGPASSWORD=your_password psql -h your-rds-endpoint -U ecobottle -d ecobottle -c "SELECT 1;"
```

## Emergency Procedures

### 1. Secret Compromise

If secrets are compromised:

1. **Immediate Actions:**
   ```bash
   # Rotate all affected secrets
   # Run secret rotation workflow
   # Monitor for unauthorized access
   ```

2. **Database Access:**
   ```bash
   # Change database password
   aws rds modify-db-instance --db-instance-identifier ecobottle-db --master-user-password NEW_PASSWORD
   ```

3. **Redis Access:**
   ```bash
   # Rotate Redis auth token
   aws elasticache modify-replication-group --replication-group-id ecobottle-redis --auth-token NEW_TOKEN
   ```

### 2. Complete Recovery

If complete secret recovery is needed:

1. Generate all new secrets
2. Update GitHub repository secrets
3. Run setup-secrets workflow
4. Deploy with new configuration
5. Update monitoring and backup systems

## Automation

### Scheduled Secret Rotation

Create a scheduled workflow for automatic rotation:

```yaml
# .github/workflows/scheduled-rotation.yml
on:
  schedule:
    - cron: '0 2 1 * *'  # Monthly at 2 AM on 1st day
```

### Monitoring Integration

- Set up alerts for failed deployments
- Monitor secret usage in CloudWatch
- Track deployment metrics in Grafana
- Configure Slack/Discord notifications
