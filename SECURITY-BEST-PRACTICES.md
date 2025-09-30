# 🔒 Security Best Practices for EcoBottle

## 🚨 Critical Security Rules

### ❌ NEVER DO THIS:
- **DON'T** commit secrets to Git
- **DON'T** share secrets in chat/email
- **DON'T** log secrets in application logs
- **DON'T** hardcode credentials in source code
- **DON'T** use weak passwords or default credentials

### ✅ ALWAYS DO THIS:
- **DO** use environment variables for secrets
- **DO** rotate secrets regularly (monthly)
- **DO** use strong, unique passwords
- **DO** enable two-factor authentication
- **DO** monitor for unauthorized access

## 🔐 Secret Management

### GitHub Repository Secrets
```bash
# Use GitHub CLI to set secrets securely
echo "secret_value" | gh secret set SECRET_NAME --env production

# Never expose secrets in scripts
echo "SECRET: *******" # Good
echo "SECRET: $SECRET_VALUE" # BAD!
```

### Environment Variables
```bash
# Production .env file
DATABASE_URL=postgresql://username:password@host:5432/db
JWT_SECRET=$(openssl rand -hex 32)
NEXTAUTH_SECRET=$(openssl rand -hex 16)

# Secure file permissions
chmod 600 .env.prod
chown root:root .env.prod
```

### SSH Key Security
```bash
# Generate secure SSH key
ssh-keygen -t rsa -b 4096 -C "deployment@ecobottle"

# Secure permissions
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub

# Use key-based authentication only
echo "PasswordAuthentication no" >> /etc/ssh/sshd_config
```

## 🛡️ Infrastructure Security

### EC2 Security Groups
```bash
# Minimal required ports
Port 22  - SSH (Your IP only)
Port 80  - HTTP (0.0.0.0/0)
Port 443 - HTTPS (0.0.0.0/0)

# Monitoring ports (restricted)
Port 3001 - Grafana (Your IP only)
Port 9090 - Prometheus (Your IP only)
```

### Database Security
```bash
# RDS Security
- Enable encryption at rest
- Use SSL/TLS connections
- Restrict security group access
- Enable backup encryption
- Use strong master password
- Enable parameter group logging
```

### Redis Security
```bash
# ElastiCache Security
- Enable AUTH token
- Use encryption in transit
- Enable encryption at rest
- Restrict subnet access
- Use VPC security groups
```

## 🔍 Monitoring & Alerting

### Security Monitoring
```yaml
# Prometheus alerts for security events
- alert: UnauthorizedAccess
  expr: rate(http_requests_total{status_code="401"}[5m]) > 0.1
  for: 1m
  
- alert: HighErrorRate
  expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
  for: 2m
```

### Log Monitoring
```bash
# Monitor for suspicious activity
- Failed login attempts
- Unauthorized API access
- Database connection failures
- Unusual traffic patterns
- File system changes
```

## 🔄 Secret Rotation Schedule

### Monthly Rotation
- JWT_SECRET
- NEXTAUTH_SECRET
- Database passwords
- Redis AUTH tokens

### Quarterly Rotation
- SSH keys
- SSL certificates
- OAuth credentials
- Backup encryption keys

### Annual Rotation
- AWS access keys
- Service accounts
- Master passwords

## 🚨 Incident Response

### If Secrets Are Compromised

1. **Immediate Actions (0-1 hour)**
   ```bash
   # Rotate affected secrets immediately
   ./setup-github-secrets.sh
   
   # Deploy new secrets
   # Go to Actions → Setup Deployment Secrets → Rotate secrets
   
   # Monitor for unauthorized access
   tail -f /var/log/nginx/access.log
   ```

2. **Investigation (1-4 hours)**
   ```bash
   # Check access logs
   grep "401\|403\|500" /var/log/nginx/access.log
   
   # Review database connections
   SELECT * FROM pg_stat_activity;
   
   # Check for unauthorized changes
   git log --oneline --since="24 hours ago"
   ```

3. **Recovery (4-24 hours)**
   ```bash
   # Full security audit
   # Update all credentials
   # Review and update access controls
   # Document incident and lessons learned
   ```

### Emergency Contacts
```
Security Team: security@yourcompany.com
DevOps Team: devops@yourcompany.com
AWS Support: Create support case
```

## 🔐 Compliance & Auditing

### Security Checklist
- [ ] All secrets stored in GitHub Secrets
- [ ] No hardcoded credentials in code
- [ ] SSH keys rotated quarterly
- [ ] Database passwords meet complexity requirements
- [ ] Two-factor authentication enabled
- [ ] Security groups follow least privilege
- [ ] SSL/TLS enabled for all connections
- [ ] Regular security scans performed
- [ ] Backup encryption enabled
- [ ] Access logs monitored

### Audit Trail
```bash
# GitHub audit log
gh api /user/audit-log

# AWS CloudTrail
aws logs describe-log-groups --log-group-name-prefix CloudTrail

# Application logs
docker-compose logs backend | grep -i "auth\|security\|error"
```

## 🛠️ Security Tools

### Vulnerability Scanning
```yaml
# Trivy security scanner
- name: Run Trivy scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    scan-ref: '.'
    format: 'sarif'
```

### Dependency Auditing
```bash
# npm audit
npm audit --audit-level=high

# Yarn audit  
yarn audit --level high

# GitHub Dependabot
# Automatically enabled in GitHub repository
```

### Code Security
```yaml
# CodeQL security analysis
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: javascript-typescript
```

## 📚 Security Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS Security Best Practices](https://docs.aws.amazon.com/security/)
- [GitHub Security](https://docs.github.com/en/code-security)

### Training
- Security awareness training
- DevSecOps practices
- Incident response procedures
- Regular security updates

### Tools
- **GitHub Security:** Dependabot, CodeQL, Secret scanning
- **AWS Security:** IAM, CloudTrail, GuardDuty, Security Hub
- **Container Security:** Trivy, Docker Bench, CIS benchmarks
- **Monitoring:** Prometheus, Grafana, ELK stack

## 🎯 Security Metrics

### KPIs to Track
- Mean time to detect (MTTD)
- Mean time to respond (MTTR)
- Number of security incidents
- Vulnerability scan results
- Failed authentication attempts
- Secret rotation compliance

### Reporting
- Weekly security summary
- Monthly vulnerability report
- Quarterly security review
- Annual security assessment

Remember: **Security is everyone's responsibility!** 🛡️
