# Environment Configuration Guide

## Available Environment Files

- `.env.production` - Production environment (AWS managed services)
- `.env.staging` - Staging environment (smaller resources)
- `.env.development` - Local development environment

## Usage

### Development
```bash
cp .env.development .env
npm run dev
```

### Staging Deployment
```bash
cp .env.staging .env.prod
./deploy-to-ec2.sh
```

### Production Deployment
```bash
cp .env.production .env.prod
./deploy-to-ec2.sh
```

## Environment Variables Explained

### Core Application
- `NODE_ENV` - Application environment (development/staging/production)
- `PORT` - Backend API port (default: 4000)
- `PROM_PORT` - Prometheus metrics port (default: 9100)

### Database
- `DATABASE_URL` - PostgreSQL connection string
- `DB_PASSWORD` - Database password (for reference)

### Cache
- `REDIS_URL` - Redis connection string

### URLs
- `NEXTAUTH_URL` - Frontend URL for NextAuth
- `NEXT_PUBLIC_API_BASE` - API base URL for frontend
- `CORS_ORIGIN` - Allowed CORS origins

### Security
- `JWT_SECRET` - JWT token signing secret (64 chars recommended)
- `NEXTAUTH_SECRET` - NextAuth signing secret (32 chars recommended)

### OAuth
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - OAuth callback URL

### Monitoring
- `GRAFANA_USER` - Grafana admin username
- `GRAFANA_PASSWORD` - Grafana admin password

### Performance
- `MAX_CONNECTIONS` - Maximum database connections
- `TIMEOUT_MS` - Request timeout in milliseconds

### Feature Flags
- `ENABLE_METRICS` - Enable Prometheus metrics
- `ENABLE_CACHE` - Enable Redis caching
- `ENABLE_RATE_LIMITING` - Enable API rate limiting

## Security Notes

1. **Never commit .env files to git**
2. **Use different secrets for each environment**
3. **Rotate secrets regularly in production**
4. **Use AWS Secrets Manager for production secrets**
5. **Restrict database access to application IPs only**

## Production Checklist

- [ ] Strong unique passwords for all services
- [ ] SSL certificates configured
- [ ] Firewall rules properly set
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented
- [ ] Log rotation configured
- [ ] Security updates automated

## Generating Secure Secrets

```bash
# JWT Secret (64 chars)
openssl rand -hex 32

# NextAuth Secret (32 chars)
openssl rand -hex 16

# Random password
openssl rand -base64 32
```
