# EcoBottle — Full-Stack Production Demo

A production-ready, scalable demo: Next.js 15 + Node/Express + PostgreSQL (Prisma) + Redis + NGINX, with SSR, JWT auth, CRUD, rate limiting, caching, Prometheus metrics, GitOps deployment, and load testing via Artillery.

> Built to run locally via Docker Compose and deploy to production via GitOps with Argo CD.

---

## 🚀 Quick Start

### Local Development
```bash
# 1. Clone repository
git clone https://github.com/your-username/eco_bottle.git
cd eco_bottle

# 2. Setup environment
cp frontend/env.template frontend/.env.local
# Edit frontend/.env.local with your values

# 3. Start with Docker Compose
docker compose up --build

# 4. Access
# Frontend: http://localhost:3000
# API: http://localhost:4000
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin123)
```

### Production Deployment (GitOps)
```bash
# See GITOPS-QUICKSTART.md for 5-minute production setup
```

---

## 📁 Project Structure

```
eco-bottle/
├── README.md
├── docker-compose.yml              # Local development
├── docker-compose.monitoring.yml   # Monitoring stack
├── docker-compose.ci.yml          # CI environment
├── .github/workflows/              # CI/CD pipelines
│   ├── ci.yml                      # Main CI pipeline
│   ├── gitops-deploy.yml          # GitOps deployment
│   └── load-test.yml              # Load testing
├── infra/                          # Infrastructure as Code
│   ├── helm/                       # Helm charts
│   ├── argocd/                     # Argo CD applications
│   └── README.md                   # Infrastructure docs
├── frontend/                       # Next.js 15 App Router
│   ├── src/
│   │   ├── app/                    # App Router pages
│   │   ├── components/             # React components
│   │   ├── lib/                    # Utilities
│   │   └── styles/                 # Global styles
│   ├── package.json
│   ├── next.config.mjs
│   ├── vercel.json                 # Vercel deployment config
│   └── Dockerfile
├── backend/                        # Express.js API
│   ├── src/
│   │   ├── routes/                 # API routes
│   │   ├── middleware/             # Express middleware
│   │   ├── services/               # Business services
│   │   ├── oauth/                  # OAuth providers
│   │   └── prisma/                 # Database schema
│   ├── scripts/                    # Utility scripts
│   ├── package.json
│   └── Dockerfile
├── nginx/                          # Load balancer config
├── prometheus/                     # Metrics config
├── monitoring/                     # Monitoring stack
└── loadtest/                       # Load testing config
```

---

## 🛠 Technology Stack

### Frontend
- **Next.js 15** with App Router
- **React 18** with TypeScript
- **NextAuth v5** for authentication
- **Tailwind CSS** + **shadcn/ui** components
- **Framer Motion** for animations
- **Sonner** for notifications

### Backend
- **Node.js** + **Express.js**
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **Redis** for caching
- **JWT** authentication
- **Rate limiting** and security middleware
- **Prometheus** metrics

### Infrastructure
- **Docker** + **Docker Compose**
- **NGINX** load balancer
- **GitOps** with **Argo CD**
- **Helm** charts for Kubernetes
- **GitHub Actions** CI/CD
- **Prometheus** + **Grafana** monitoring

### Testing & Quality
- **Artillery** load testing
- **ESLint** + **TypeScript** checks
- **Trivy** security scanning
- **CodeQL** static analysis

---

## 🌟 Features

### Core Features
- ✅ **User Authentication** (Email/Password + Google OAuth)
- ✅ **Product Catalog** with search and filtering
- ✅ **Wishlist Management** with real-time updates
- ✅ **User Profiles** with settings
- ✅ **Responsive Design** (mobile-first)

### Technical Features
- ✅ **SSR/SSG** with Next.js App Router
- ✅ **API Rate Limiting** (300 req/min per IP)
- ✅ **Redis Caching** with auto-invalidation
- ✅ **JWT Authentication** with refresh tokens
- ✅ **Database Migrations** with Prisma
- ✅ **Real-time Metrics** (Prometheus + Grafana)
- ✅ **Load Balancing** (NGINX)
- ✅ **Auto-scaling** (HPA in production)

### DevOps Features
- ✅ **GitOps Deployment** with Argo CD
- ✅ **Multi-stage CI/CD** pipelines
- ✅ **Automated Testing** (lint, type-check, security)
- ✅ **Container Security** scanning
- ✅ **Performance Testing** with Artillery
- ✅ **Infrastructure as Code** (Helm charts)

---

## 🔧 Environment Setup

### Frontend Environment Variables

Create `frontend/.env.local`:

```bash
# API Base URL
NEXT_PUBLIC_API_BASE=http://localhost:4000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-secret-nextauth-development-key-32-chars-minimum

# Google OAuth (Get from Google Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Backend Environment Variables

Backend uses `.env` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/ecobottle

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Redis
REDIS_URL=redis://redis:6379

# Server
PORT=4000
PROM_PORT=9100

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback

# Frontend URL
APP_AFTER_LOGIN_URL=http://localhost:3000/profile
```

---

## 🐳 Docker Compose Services

### Development Stack (`docker-compose.yml`)
```yaml
services:
  nginx:       # Load balancer (port 8080)
  postgres:    # Database (port 5432)
  redis:       # Cache (port 6379)
  api1:        # Backend instance 1 (port 4000)
  api2:        # Backend instance 2 (port 4001)
  frontend:    # Next.js app (port 3000)
```

### Monitoring Stack (`docker-compose.monitoring.yml`)
```yaml
services:
  prometheus:     # Metrics collection (port 9090)
  grafana:        # Dashboards (port 3001)
  alertmanager:   # Alerting (port 9093)
  node-exporter:  # System metrics (port 9102)
  cadvisor:       # Container metrics (port 8080)
```

---

## 📊 Monitoring & Observability

### Metrics Collection
- **Application Metrics**: Request duration, error rates, cache hit/miss
- **Business Metrics**: User registrations, logins, product views
- **System Metrics**: CPU, memory, disk, network
- **Container Metrics**: Docker container stats

### Dashboards
- **Main Dashboard**: Overview of all services
- **API Performance**: Request latency, throughput, errors
- **System Health**: Resource utilization, alerts
- **Business KPIs**: User activity, conversion rates

### Alerting
- **Critical**: Service down, high error rate, resource exhaustion
- **Warning**: High latency, cache miss rate, disk space

Access monitoring:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)
- **AlertManager**: http://localhost:9093

---

## 🚀 Deployment

### Local Development
```bash
# Start all services
docker compose up --build

# Start with monitoring
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up --build

# View logs
docker compose logs -f api1
docker compose logs -f frontend
```

### Production (GitOps)
1. **Setup Kubernetes cluster** (EKS, GKE, AKS)
2. **Install Argo CD** in cluster
3. **Configure GitHub secrets** for CI/CD
4. **Push to main branch** → automatic deployment

See `GITOPS-QUICKSTART.md` for detailed instructions.

### Vercel (Frontend Only)
1. Connect repository to Vercel
2. Set environment variables
3. Deploy automatically on push

---

## 🧪 Testing

### Load Testing
```bash
# Run load test
npm run load-test

# Custom scenarios
artillery run loadtest/artillery.yml
```

### Type Checking
```bash
# Frontend
cd frontend && npm run type-check

# Backend
cd backend && npm run type-check
```

### Linting
```bash
# Frontend
cd frontend && npm run lint

# Backend
cd backend && npm run lint
```

---

## 🔒 Security

### Authentication
- **JWT tokens** with expiration
- **bcrypt** password hashing
- **Rate limiting** per IP/user
- **CORS** configuration

### Infrastructure
- **Container scanning** with Trivy
- **Static analysis** with CodeQL
- **Security headers** (Helmet.js)
- **HTTPS** in production

### Best Practices
- **Environment variables** for secrets
- **Least privilege** container permissions
- **Network policies** in Kubernetes
- **Regular dependency updates**

---

## ⚡ Performance

### Caching Strategy
- **Redis** for API responses (30-60s TTL)
- **Next.js** static generation
- **CDN** for static assets
- **Database** query optimization

### Scaling
- **Horizontal Pod Autoscaler** (2-10 replicas)
- **Database** connection pooling
- **Load balancing** with NGINX
- **Resource** requests/limits

### Optimizations
- **Image optimization** with Next.js
- **Bundle splitting** and lazy loading
- **Database indexing**
- **Compression** (gzip)

---

## 📈 Load Testing Results

### Test Scenarios
- **Product List**: 100 virtual users, 5 minutes
- **Authentication**: Login/CRUD operations
- **Mixed Load**: Real user simulation

### Performance Targets
- **Response Time**: P95 < 200ms
- **Throughput**: 1000+ RPS
- **Error Rate**: < 0.1%
- **Availability**: 99.9%

---

## 🛠 Development

### Prerequisites
- **Node.js** 18+
- **Docker** & Docker Compose
- **Git**

### Quick Commands
```bash
# Install dependencies
npm run install:all

# Start development
npm run dev

# Build all
npm run build:all

# Test all
npm run test:all

# Load test
npm run load-test
```

### Database Management
```bash
# Run migrations
cd backend && npx prisma migrate dev

# Seed database
cd backend && npx prisma db seed

# View database
cd backend && npx prisma studio
```

---

## 📚 Documentation

- **[Infrastructure Guide](infra/README.md)** - Kubernetes deployment
- **[GitOps Quick Start](GITOPS-QUICKSTART.md)** - 5-minute production setup
- **[Monitoring Setup](MONITORING.md)** - Metrics and alerting
- **[CI/CD Status](CI-CD-STATUS.md)** - Pipeline documentation
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and fixes

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- **TypeScript** everywhere
- **ESLint** + **Prettier** formatting
- **Conventional Commits**
- **Test coverage** > 80%

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 Features Showcase

This project demonstrates:

### 🎯 **Production-Ready Architecture**
- Microservices with load balancing
- Horizontal auto-scaling
- Health checks and monitoring
- Security best practices

### 🔄 **Modern CI/CD**
- GitOps with Argo CD
- Multi-stage pipelines
- Automated testing and security scans
- Zero-downtime deployments

### 📊 **Observability**
- Comprehensive metrics collection
- Real-time dashboards
- Proactive alerting
- Performance monitoring

### 🛡 **Enterprise Security**
- JWT authentication with refresh
- OAuth 2.0 integration
- Rate limiting and DDoS protection
- Container security scanning

### ⚡ **High Performance**
- Redis caching with auto-invalidation
- Database query optimization
- CDN integration
- Load testing validation

---

**Built with ❤️ for demonstrating modern full-stack development practices.**

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/your-username/eco_bottle).
