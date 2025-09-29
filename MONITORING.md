# 📊 EcoBottle Monitoring & Metrics

Complete monitoring for EcoBottle with Prometheus, Grafana, AlertManager, and extended application metrics.

## 🚀 Quick Start

```bash
# 1. Start backend with metrics (already wired)
cd backend && npm run dev

# 2. Exercise endpoints to populate metrics
./scripts/load-test.sh

# 3. Start full monitoring stack (requires Docker)
docker compose -f docker-compose.monitoring.yml up -d
```

## 📊 Available Metrics

### ✅ HTTP Metrics
- `http_requests_total` — Total number of HTTP requests
- `http_request_duration_ms` — API response time (histogram)
- `http_active_connections` — Active HTTP connections

### ✅ Cache Metrics
- `cache_hits_total` / `cache_misses_total` — Cache hit/miss counters
- `cache_operation_duration_ms` — Cache operation duration
- `cache_size_bytes` — Cache size

### ✅ Database Metrics
- `database_connections_active` — Active DB connections
- `database_query_duration_ms` — DB query durations
- `database_errors_total` — Database errors

### ✅ Business Metrics
- `user_registrations_total` — User registrations
- `user_logins_total{method}` — Logins (credentials/google)
- `product_views_total{product_id}` — Product views
- `api_errors_total{endpoint,error_type,status}` — API errors

### ✅ System Metrics
- `process_memory_usage_bytes{type}` — Memory usage (rss, heapUsed, heapTotal)
- `process_cpu_usage_percent` — CPU usage
- Default Node.js runtime metrics (GC, event loop, etc.)

## 🔗 Endpoints

| Service | URL | Description |
|--------|-----|-------------|
| API Metrics | http://localhost:9100/metrics | Prometheus metrics endpoint |
| Health Check | http://localhost:9100/health | Metrics server health |
| Prometheus | http://localhost:9090 | Metrics collection & storage |
| Grafana | http://localhost:3001 (admin/admin123) | Dashboards |
| AlertManager | http://localhost:9093 | Alert routing & notifications |

## 🔥 Alert Rules

### Critical
- APIDown — API unavailable (>1 min)
- HighErrorRate — Error rate > 5%
- HighDatabaseErrors — DB errors > 5/s

### Warnings
- HighAPILatency — Response time > 1s
- HighMemoryUsage — Memory usage > 90%
- HighCPUUsage — CPU > 80%
- LowCacheHitRate — Cache hit rate < 80%

## 📈 Grafana Dashboard

### Panels
1. HTTP Requests by Status
2. API Response Time (p95 & p50)
3. Active Connections (gauge)
4. Memory Usage (process)
5. Cache Hit Rate
6. User Activity (registrations & logins)

### Auto-provisioning
Dashboard is auto-loaded from `monitoring/grafana/dashboards/eco-bottle-overview.json`.

## 🧪 Testing

### Generate Load
```bash
# Automatic mixed load
./scripts/load-test.sh

# Manual checks
curl http://localhost:4000/api/health     # Successful requests
curl http://localhost:4000/api/products   # Cached requests
curl http://localhost:4000/api/404        # 404 errors
```

### Inspect Metrics
```bash
# All metrics
curl http://localhost:9100/metrics

# Specific metrics
curl -s http://localhost:9100/metrics | grep "http_requests_total"
curl -s http://localhost:9100/metrics | grep "process_memory"
curl -s http://localhost:9100/metrics | grep "cache_hits"
```

## ⚡ Sample Results

After running `load-test.sh`:

```promql
# HTTP requests
http_requests_total{method="GET",route="/api/health",status="200"} 25
http_requests_total{method="GET",route="/api/products",status="200"} 18
http_requests_total{method="GET",route="/api/nonexistent",status="404"} 5

# Successful authentication
user_logins_total{method="credentials"} 1

# Cache is working
cache_hits_total{cache_key_prefix="/api/products"} 5

# Process memory
process_memory_usage_bytes{type="heapUsed"} 20655096
process_memory_usage_bytes{type="rss"} 146575360
```

## 🔧 Code Integration

### Add New Metrics
```typescript
// In services/metrics.ts
export const customCounter = new client.Counter({
  name: 'custom_events_total',
  help: 'Custom business events',
  labelNames: ['event_type']
});

// In application code
import { customCounter } from '../services/metrics';
customCounter.inc({ event_type: 'order_created' });
```

### Measure Execution Time
```typescript
import { httpDuration } from '../services/metrics';

const timer = httpDuration.startTimer({ method: 'POST', route: '/api/orders' });
// ... do work ...
timer({ status: '200' });
```

## 🚨 Production Recommendations

### Retention & storage
- Prometheus: 15 days (adjust in config)
- Metrics scrape: every 15s
- Alert rules: evaluated every 15s

### Resources
- Prometheus: ~500MB RAM + storage
- Grafana: ~200MB RAM
- Backend metrics: negligible overhead (<1% CPU)

### Security
- Change Grafana password (admin/admin123)
- Enable HTTPS for production
- Restrict metrics access (firewall/VPN)

## 📚 Useful PromQL Queries

```promql
# Top endpoints by latency
topk(5, histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (route, le)))

# Error percentage
sum(rate(api_errors_total[5m])) / sum(rate(http_requests_total[5m])) * 100

# Daily user growth
increase(user_registrations_total[24h])

# Most popular products
topk(10, sum(rate(product_views_total[1h])) by (product_id))

# Cache effectiveness
sum(rate(cache_hits_total[5m])) / (sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m])))
```

---

🎉 **EcoBottle monitoring is production-ready!**

All metrics are available, the dashboard is provisioned, and alerts are configured. The system provides full observability from HTTP requests to business KPIs.
