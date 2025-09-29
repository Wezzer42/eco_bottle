# EcoBottle Monitoring Stack

Complete monitoring of the EcoBottle application with Prometheus, Grafana and AlertManager.

## 🚀 Quick Start

```bash
# Start full monitoring stack
docker compose -f docker-compose.monitoring.yml up -d

# Check status
docker compose -f docker-compose.monitoring.yml ps
```

## 📊 Компоненты

### Prometheus (http://localhost:9090)
- Scrapes metrics from all services
- Stores time series
- Evaluates alert rules

### Grafana (http://localhost:3001)
- Login: admin / admin123
- Metrics visualization
- Monitoring dashboards

### AlertManager (http://localhost:9093)
- Alert management
- Notification routing
- Grouping and inhibition

### Node Exporter (http://localhost:9100)
- Host system metrics
- CPU, memory, disk, network

### cAdvisor (http://localhost:8080)
- Docker container metrics
- Container resources

## 📈 Метрики

### HTTP Metrics
- `http_request_duration_ms` - API response time
- `http_requests_total` - Request count
- `http_active_connections` - Active connections

### Cache Metrics
- `cache_hits_total` / `cache_misses_total` - Cache hit/miss
- `cache_operation_duration_ms` - Cache operation time
- `cache_size_bytes` - Cache size

### Database Metrics
- `database_connections_active` - Active connections
- `database_query_duration_ms` - Query time
- `database_errors_total` - DB errors

### Business Metrics
- `user_registrations_total` - Registrations
- `user_logins_total` - Logins
- `product_views_total` - Product views
- `api_errors_total` - API errors

### System Metrics
- `process_memory_usage_bytes` - Memory usage
- `process_cpu_usage_percent` - CPU usage

## 🚨 Alerts

### Critical
- **APIDown** - API is down
- **HighErrorRate** - Error rate > 5%
- **HighDatabaseErrors** - Many DB errors

### Warnings
- **HighAPILatency** - High response time (>1s)
- **HighMemoryUsage** - High memory usage (>90%)
- **HighCPUUsage** - High CPU usage (>80%)
- **LowCacheHitRate** - Low cache hit rate (<80%)
- **HighActiveConnections** - Many connections (>100)

## 🔧 Configuration

### Add new metrics
1. Add metric in `backend/src/services/metrics.ts`
2. Register it in `register`
3. Use in application code

### Configure alerts
1. Edit `monitoring/alerts.yml`
2. Restart Prometheus: `docker compose restart prometheus`

### Custom dashboards
1. Create a .json file in `monitoring/grafana/dashboards/`
2. Grafana will auto-load changes

## 📱 Integrations

### Slack
```yaml
# In alertmanager.yml
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'YOUR_WEBHOOK_URL'
        channel: '#alerts'
```

### Telegram
```yaml
# In alertmanager.yml  
receivers:
  - name: 'telegram'
    webhook_configs:
      - url: 'https://api.telegram.org/bot<TOKEN>/sendMessage'
```

### Email
```yaml
# In alertmanager.yml
 global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@eco-bottle.com'

receivers:
  - name: 'email'
    email_configs:
      - to: 'admin@eco-bottle.com'
```

## 🔍 Useful PromQL queries

```promql
# Top endpoints by latency
topk(5, histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (route, le)))

# Error rate by endpoint
 sum(rate(api_errors_total[5m])) by (endpoint) / sum(rate(http_requests_total[5m])) by (route) * 100

# Daily users
increase(user_registrations_total[24h])

# Most popular products
 topk(10, sum(rate(product_views_total[1h])) by (product_id))
```

## 🛠 Устранение неполадок

### Prometheus не видит targets
1. Проверить доступность метрик: `curl http://localhost:9001/metrics`
2. Проверить сеть Docker: `docker network ls`
3. Использовать `host.docker.internal` для локальных сервисов

### Grafana не показывает данные
1. Проверить datasource в Grafana
2. Проверить запросы в Prometheus
3. Проверить время (должно быть в пределах retention)

### Алерты не приходят
1. Проверить правила в Prometheus UI
2. Проверить AlertManager UI
3. Проверить конфигурацию receivers

## 📚 Ресурсы

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [AlertManager Guide](https://prometheus.io/docs/alerting/latest/alertmanager/)
