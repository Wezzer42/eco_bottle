# 🚀 EcoBottle Quick Start Guide

## Prerequisites

- AWS CLI configured
- Your EC2 instance: `your-production-host.com`
- AWS RDS and ElastiCache already set up

## Option 1: Quick Deploy (if you have SSH key)

```bash
# 1. Set up your SSH key
./setup-ssh-key.sh

# 2. Deploy to EC2
./deploy-to-ec2.sh
```

## Option 2: Manual Setup

### 1. SSH Key Setup

**If you have a .pem file:**
```bash
cp your-key.pem ~/.ssh/
chmod 400 ~/.ssh/your-key.pem
```

**If you need to create a new key:**
```bash
aws ec2 create-key-pair --key-name ecobottle-key --query 'KeyMaterial' --output text > ~/.ssh/ecobottle-key.pem
chmod 400 ~/.ssh/ecobottle-key.pem
```

### 2. Update Deploy Script

Edit `deploy-to-ec2.sh`:
```bash
KEY_FILE="$HOME/.ssh/your-actual-key-name.pem"
```

### 3. Deploy

```bash
./deploy-to-ec2.sh
```

## What Gets Deployed

- ✅ Full-stack application (Frontend + Backend)
- ✅ Nginx reverse proxy
- ✅ AWS RDS PostgreSQL integration
- ✅ AWS ElastiCache Redis integration
- ✅ Prometheus + Grafana monitoring
- ✅ Production-ready configuration

## Access Your Application

After deployment:

- **Frontend**: http://your-production-host.com
- **API**: http://your-production-host.com/api
- **Health**: http://your-production-host.com/health
- **Grafana**: http://your-production-host.com/grafana
- **Prometheus**: http://your-production-host.com/prometheus

## Default Credentials

- **Grafana**: admin / EcoBotProd2024!

## Troubleshooting

### SSH Connection Issues
```bash
# Test SSH connection
ssh -i ~/.ssh/your-key.pem ubuntu@your-production-host.com

# Check security group allows SSH (port 22) from your IP
aws ec2 describe-security-groups --group-ids sg-your-group-id
```

### Application Issues
```bash
# SSH to server and check logs
ssh -i ~/.ssh/your-key.pem ubuntu@your-production-host.com
cd /home/ubuntu/ecobottle
docker-compose -f docker-compose.simple.yml -f docker-compose.aws.yml logs -f
```

### Database Issues
```bash
# Test RDS connection
./init-rds.sh
```

## Security Checklist

- [ ] SSH key permissions set to 400
- [ ] Security group allows only necessary ports
- [ ] Change default Grafana password
- [ ] Enable HTTPS with Let's Encrypt (optional)
- [ ] Configure automated backups

## Next Steps

1. **Domain Setup**: Point your domain to the EC2 IP
2. **SSL/HTTPS**: Setup Let's Encrypt certificates
3. **Monitoring**: Configure alerts in Grafana
4. **Backups**: Setup automated database backups
5. **Scaling**: Consider Auto Scaling Groups for production

## Support

If you encounter issues:
1. Check the deployment logs
2. Verify AWS services are running
3. Test network connectivity
4. Review security group rules
