# EcoBottle Monitoring Stack

Полноценный мониторинг приложения EcoBottle с использованием Prometheus, Grafana и AlertManager.

## 🚀 Быстрый запуск

```bash
# Запуск полного стека мониторинга
docker-compose -f docker-compose.monitoring.yml up -d

# Проверка статуса
docker-compose -f docker-compose.monitoring.yml ps
```

## 📊 Компоненты

### Prometheus (http://localhost:9090)
- Сбор метрик из всех сервисов
- Хранение временных рядов
- Оценка правил алертов

### Grafana (http://localhost:3001)
- **Логин:** admin / admin123
- Визуализация метрик
- Dashboards для мониторинга

### AlertManager (http://localhost:9093)
- Управление алертами
- Маршрутизация уведомлений
- Группировка и подавление

### Node Exporter (http://localhost:9100)
- Системные метрики хоста
- CPU, память, диск, сеть

### cAdvisor (http://localhost:8080)
- Метрики Docker контейнеров
- Ресурсы контейнеров

## 📈 Метрики

### HTTP Метрики
- `http_request_duration_ms` - Время ответа API
- `http_requests_total` - Количество запросов
- `http_active_connections` - Активные подключения

### Кеш Метрики
- `cache_hits_total` / `cache_misses_total` - Hit/miss кеша
- `cache_operation_duration_ms` - Время операций кеша
- `cache_size_bytes` - Размер кеша

### База Данных
- `database_connections_active` - Активные подключения
- `database_query_duration_ms` - Время запросов
- `database_errors_total` - Ошибки БД

### Бизнес Метрики
- `user_registrations_total` - Регистрации пользователей
- `user_logins_total` - Авторизации
- `product_views_total` - Просмотры товаров
- `api_errors_total` - Ошибки API

### Системные Метрики
- `process_memory_usage_bytes` - Использование памяти
- `process_cpu_usage_percent` - Загрузка CPU

## 🚨 Алерты

### Критические
- **APIDown** - API недоступен
- **HighErrorRate** - Высокий процент ошибок (>5%)
- **HighDatabaseErrors** - Много ошибок БД

### Предупреждения
- **HighAPILatency** - Высокое время ответа (>1s)
- **HighMemoryUsage** - Высокое использование памяти (>90%)
- **HighCPUUsage** - Высокая загрузка CPU (>80%)
- **LowCacheHitRate** - Низкий hit rate кеша (<80%)
- **HighActiveConnections** - Много подключений (>100)

## 🔧 Конфигурация

### Добавление новых метрик
1. Добавить метрику в `backend/src/services/metrics.ts`
2. Зарегистрировать в `register`
3. Использовать в коде приложения

### Настройка алертов
1. Редактировать `monitoring/alerts.yml`
2. Перезапустить Prometheus: `docker-compose restart prometheus`

### Кастомные dashboards
1. Создать .json файл в `monitoring/grafana/dashboards/`
2. Grafana автоматически подхватит изменения

## 📱 Интеграции

### Slack
```yaml
# В alertmanager.yml
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'YOUR_WEBHOOK_URL'
        channel: '#alerts'
```

### Telegram
```yaml
# В alertmanager.yml  
receivers:
  - name: 'telegram'
    webhook_configs:
      - url: 'https://api.telegram.org/bot<TOKEN>/sendMessage'
```

### Email
```yaml
# В alertmanager.yml
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@eco-bottle.com'

receivers:
  - name: 'email'
    email_configs:
      - to: 'admin@eco-bottle.com'
```

## 🔍 Полезные PromQL запросы

```promql
# Топ endpoint'ов по времени ответа
topk(5, histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (route, le)))

# Процент ошибок по endpoint'ам
sum(rate(api_errors_total[5m])) by (endpoint) / sum(rate(http_requests_total[5m])) by (route) * 100

# Рост пользователей за день
increase(user_registrations_total[24h])

# Самые популярные товары
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
