# Production Environment Configuration

# AWS RDS PostgreSQL
DB_PASSWORD=Touhou13
DATABASE_URL=postgresql://ecobottle:Touhou13@ecobottle.c5a0ccyi8zva.ap-northeast-2.rds.amazonaws.com:5432/ecobottle

# AWS ElastiCache Serverless Redis
REDIS_URL=rediss://ecobottle.cache.amazonaws.com:6379

# URLs
NEXTAUTH_URL=http://ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com
NEXT_PUBLIC_API_BASE=http://ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com/api
CORS_ORIGIN=http://ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com

# OAuth Google
GOOGLE_REDIRECT_URI=http://ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com/api/auth/google/callback

# AWS Region
AWS_REGION=ap-northeast-2

# Environment
NODE_ENV=production
PORT=4000
PROM_PORT=9100

# Monitoring
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin123

# Security (will be generated below)
JWT_SECRET=your_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here

# Feature flags
ENABLE_METRICS=true
ENABLE_CACHE=true
ENABLE_RATE_LIMITING=true
