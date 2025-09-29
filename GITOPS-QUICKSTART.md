# GitOps Quick Start Guide

Quick GitOps setup for the EcoBottle project.

## 🚀 Five Minutes to Production

### 1. Prerequisites (1 min)

```bash
# Clone repository
git clone https://github.com/your-username/eco_bottle.git
cd eco_bottle

# Ensure you have:
# - Kubernetes cluster
# - kubectl configured
# - Helm installed
```

### 2. Install Argo CD (2 min)

```bash
# Quick install
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo

# Port-forward for UI (optional)
kubectl port-forward svc/argocd-server -n argocd 8080:443 &
```

### 3. Deploy the application (2 min)

```bash
# Update repository URL in Application
sed -i 's/your-username/YOUR_GITHUB_USERNAME/' infra/argocd/api-application.yaml

# Apply Application
kubectl apply -f infra/argocd/api-application.yaml

# Create secrets
kubectl create namespace ecobottle
kubectl create secret generic ecobottle-secrets -n ecobottle \
  --from-literal=DATABASE_URL="postgresql://user:pass@postgres:5432/ecobottle" \
  --from-literal=JWT_SECRET="super-secret-jwt-key" \
  --from-literal=REDIS_URL="redis://redis:6379"
```

## 🔧 CI/CD Configuration

### GitHub Secrets

Add to Settings → Secrets and variables → Actions:

```
GITOPS_TOKEN = "github_pat_xxxxx"  # Personal Access Token with repo permissions
```

### Container Registry

Update `infra/helm/api/values.yaml`:

```yaml
image:
  repository: ghcr.io/YOUR_USERNAME/eco_bottle/api
  tag: "latest"
```

## 📊 Vercel (Frontend)

1. Connect repository to Vercel
2. Add environment variables:

```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=super-secret-nextauth-key
NEXT_PUBLIC_API_BASE=https://api.your-domain.com
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
```

## 🎯 Workflow

1. Push code → GitHub
2. CI builds images → GitHub Container Registry  
3. CI updates tags in `values.yaml`
4. Argo CD syncs → Kubernetes

## 🔍 Monitoring

```bash
# Argo CD applications status
kubectl get applications -n argocd

# Application pods
kubectl get pods -n ecobottle

# Logs
kubectl logs -l app.kubernetes.io/name=ecobottle-api -n ecobottle -f

# Metrics (if Prometheus installed)
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
```

## 🔧 Useful commands

```bash
# Force sync
kubectl patch app ecobottle-api -n argocd --type merge -p '{"operation":{"sync":{"revision":"HEAD"}}}'

# Restart deployment
kubectl rollout restart deployment/ecobottle-api -n ecobottle

# Scale
kubectl scale deployment/ecobottle-api --replicas=3 -n ecobottle

# Update secrets
kubectl create secret generic ecobottle-secrets -n ecobottle \
  --from-literal=NEW_VAR="new-value" \
  --dry-run=client -o yaml | kubectl apply -f -
```

## 🚨 Troubleshooting

**ImagePullBackOff?**
```bash
# Check image
docker pull ghcr.io/your-username/eco_bottle/api:latest

# Check logs
kubectl describe pod -l app.kubernetes.io/name=ecobottle-api -n ecobottle
```

**Argo CD not syncing?**
```bash
# Check status
kubectl describe application ecobottle-api -n argocd

# Force sync
kubectl patch app ecobottle-api -n argocd --type merge -p '{"operation":{"sync":{"revision":"HEAD"}}}'
```

**Database connection issues?**
```bash
# Check secrets
kubectl get secret ecobottle-secrets -n ecobottle -o yaml

# Test connection
kubectl run pg-test --rm -it --image=postgres:15 -n ecobottle -- psql $DATABASE_URL
```

## 📚 Additional

- Full docs: `infra/README.md`
- Monitoring setup: `MONITORING.md`  
- Docker Compose for development: `docker-compose.yml`
- CI/CD status: `CI-CD-STATUS.md`

---

🎉 Ready! You now have Netflix-grade GitOps (almost 😉).
