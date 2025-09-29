# EcoBottle Infrastructure

GitOps-based deployment using Argo CD and Helm.

## Architecture

```
GitHub Repo (Code) → CI/CD → Container Registry
                              ↓
GitHub Repo (Infra) ← CI Updates Image Tags
                              ↓  
                          Argo CD → Kubernetes Cluster
```

## Prerequisites

1. **Kubernetes Cluster** (EKS, GKE, AKS, or local)
2. **Argo CD** installed in cluster
3. **GitHub Personal Access Token** with repo permissions
4. **Container Registry** (GitHub Container Registry recommended)

## Setup Instructions

### 1. Install Argo CD

```bash
# Create namespace
kubectl create namespace argocd

# Install Argo CD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for deployment
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward to access UI (optional)
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### 2. Configure GitHub Repository

1. Fork this repository
2. Update `infra/argocd/api-application.yaml`:
   ```yaml
   source:
     repoURL: https://github.com/YOUR-USERNAME/eco_bottle.git
   ```

3. Create GitHub Personal Access Token:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate token with `repo` permissions
   - Add as repository secret: `GITOPS_TOKEN`

### 3. Deploy Application

```bash
# Apply the Argo CD Application
kubectl apply -f infra/argocd/api-application.yaml

# Create secrets (example)
kubectl create namespace ecobottle
kubectl create secret generic ecobottle-secrets -n ecobottle \
  --from-literal=DATABASE_URL="postgresql://user:pass@host:5432/db" \
  --from-literal=JWT_SECRET="your-jwt-secret" \
  --from-literal=REDIS_URL="redis://redis:6379"
```

### 4. Configure Image Registry

Update `infra/helm/api/values.yaml`:
```yaml
image:
  repository: ghcr.io/your-username/eco_bottle/api
  tag: "latest"
```

### 5. Verify Deployment

```bash
# Check Argo CD Application status
kubectl get applications -n argocd

# Check pods
kubectl get pods -n ecobottle

# Check services
kubectl get svc -n ecobottle
```

## CI/CD Pipeline

The pipeline automatically:

1. **Builds** Docker images when code changes
2. **Pushes** images to GitHub Container Registry  
3. **Updates** Helm values with new image tags
4. **Commits** changes back to repository
5. **Argo CD syncs** automatically (GitOps)

### Environment Variables for CI/CD

Required GitHub repository secrets:
- `GITOPS_TOKEN` - Personal Access Token for updating infra repo
- `GITHUB_TOKEN` - Automatically provided

### Monitoring Pipeline

```bash
# Check CI/CD status
gh workflow list

# Check Argo CD sync status  
kubectl get applications -n argocd -w

# Check deployment rollout
kubectl rollout status deployment/ecobottle-api -n ecobottle
```

## Development Workflow

1. **Make changes** to application code
2. **Push to main** branch
3. **CI builds** and pushes new image
4. **CI updates** image tag in `values.yaml`
5. **Argo CD detects** change and deploys
6. **Monitor** deployment in Argo CD UI

## Troubleshooting

### Common Issues

**ImagePullBackOff:**
```bash
# Check image exists
docker pull ghcr.io/your-username/eco_bottle/api:latest

# Check registry permissions
kubectl get events -n ecobottle
```

**Argo CD sync issues:**
```bash
# Manual sync
kubectl patch application ecobottle-api -n argocd --type merge -p '{"operation":{"sync":{"revision":"HEAD"}}}'

# Check sync status
kubectl get application ecobottle-api -n argocd -o yaml
```

**Migration failures:**
```bash
# Check migration logs
kubectl logs -l app.kubernetes.io/name=ecobottle-api -n ecobottle --previous

# Run manual migration
kubectl run prisma-migrate --rm -it --restart=Never \
  --image=ghcr.io/your-username/eco_bottle/api:latest -n ecobottle -- \
  node scripts/migrate.js
```

### Useful Commands

```bash
# Watch deployments
kubectl get pods -n ecobottle -w

# Check application logs
kubectl logs -l app.kubernetes.io/name=ecobottle-api -n ecobottle -f

# Scale deployment
kubectl scale deployment ecobottle-api -n ecobottle --replicas=3

# Check HPA status
kubectl get hpa -n ecobottle

# Check service monitor (Prometheus)
kubectl get servicemonitor -n ecobottle
```

## Production Considerations

### Security
- Use private container registry
- Enable Pod Security Standards
- Configure Network Policies
- Use sealed secrets for sensitive data

### Monitoring
- ServiceMonitor for Prometheus scraping
- Grafana dashboards for visualization
- AlertManager for critical alerts

### Scaling
- HorizontalPodAutoscaler configured
- Resource requests/limits set
- Node autoscaling recommended

### Backup
- Database backup strategy
- Persistent volume snapshots
- Configuration backup (GitOps handles this)

## Vercel Frontend Deployment

1. **Connect Repository** to Vercel
2. **Set Environment Variables:**
   ```
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXT_PUBLIC_API_BASE=https://api.ecobottle.your-domain.com
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```
3. **Deploy** automatically on push to main

## Cost Optimization

- Use spot instances for non-production
- Configure resource requests accurately
- Enable cluster autoscaler
- Monitor with cost allocation tags
