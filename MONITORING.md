# 📊 EcoBottle Monitoring & Metrics

Полноценная система мониторинга для EcoBottle с Prometheus, Grafana, AlertManager и расширенными метриками.

## 🚀 Быстрый старт

```bash
# 1. Запуск backend с метриками (уже работает)
cd backend && npm run dev

# 2. Тестирование метрик
./scripts/load-test.sh

# 3. Запуск полного стека мониторинга (требует Docker)
docker-compose -f docker-compose.monitoring.yml up -d
```

## 📊 Доступные метрики

### ✅ HTTP Метрики
- **`http_requests_total`** - Общее количество HTTP запросов
- **`http_request_duration_ms`** - Время ответа API (гистограмма)
- **`http_active_connections`** - Активные подключения

### ✅ Кеш Метрики  
- **`cache_hits_total`** / **`cache_misses_total`** - Попадания/промахи кеша
- **`cache_operation_duration_ms`** - Время операций кеша
- **`cache_size_bytes`** - Размер кеша

### ✅ База Данных
- **`database_connections_active`** - Активные подключения к БД
- **`database_query_duration_ms`** - Время запросов к БД
- **`database_errors_total`** - Ошибки базы данных

### ✅ Бизнес Метрики
- **`user_registrations_total`** - Регистрации пользователей
- **`user_logins_total{method}`** - Авторизации (credentials/google)
- **`product_views_total{product_id}`** - Просмотры товаров  
- **`api_errors_total{endpoint,error_type,status}`** - Ошибки API

### ✅ Системные Метрики
- **`process_memory_usage_bytes{type}`** - Использование памяти (rss, heapUsed, heapTotal)
- **`process_cpu_usage_percent`** - Загрузка CPU
- Стандартные Node.js метрики (garbage collection, event loop, etc.)

## 🔗 Endpoints

| Сервис | URL | Описание |
|--------|-----|----------|
| **Метрики API** | http://localhost:9100/metrics | Prometheus метрики backend |
| **Health Check** | http://localhost:9100/health | Статус сервера метрик |
| **Prometheus** | http://localhost:9090 | Сбор и хранение метрик |
| **Grafana** | http://localhost:3001 | Dashboards (admin/admin123) |
| **AlertManager** | http://localhost:9093 | Управление алертами |

## 🔥 Конфигурация алертов

### Критические алерты
- **APIDown** - API недоступен (>1 мин)
- **HighErrorRate** - Высокий процент ошибок (>5%)
- **HighDatabaseErrors** - Много ошибок БД (>5/сек)

### Предупреждения
- **HighAPILatency** - Высокое время ответа (>1s)
- **HighMemoryUsage** - Использование памяти (>90%)
- **HighCPUUsage** - Загрузка CPU (>80%)
- **LowCacheHitRate** - Низкий hit rate кеша (<80%)

## 📈 Grafana Dashboard

### Панели мониторинга
1. **HTTP Requests by Status** - Распределение запросов по статусам
2. **API Response Time** - 95th и 50th перцентили времени ответа
3. **Active Connections** - Gauge активных подключений
4. **Memory Usage** - Использование памяти процессом
5. **Cache Hit Rate** - Эффективность кеширования
6. **User Activity** - Регистрации и логины пользователей

### Импорт dashboard
Dashboard автоматически загружается из `monitoring/grafana/dashboards/eco-bottle-overview.json`

## 🧪 Тестирование

### Генерация нагрузки
```bash
# Автоматический тест с разнообразной нагрузкой
./scripts/load-test.sh

# Ручные запросы
curl http://localhost:4000/api/health     # Успешные запросы
curl http://localhost:4000/api/products   # Кешированные запросы
curl http://localhost:4000/api/404        # Ошибки 404
```

### Проверка метрик
```bash
# Все метрики
curl http://localhost:9100/metrics

# Конкретные метрики
curl -s http://localhost:9100/metrics | grep "http_requests_total"
curl -s http://localhost:9100/metrics | grep "process_memory"
curl -s http://localhost:9100/metrics | grep "cache_hits"
```

## ⚡ Пример результатов

После запуска `load-test.sh`:

```promql
# HTTP запросы
http_requests_total{method="GET",route="/api/health",status="200"} 25
http_requests_total{method="GET",route="/api/products",status="200"} 18
http_requests_total{method="GET",route="/api/nonexistent",status="404"} 5

# Успешная авторизация
user_logins_total{method="credentials"} 1

# Кеш работает
cache_hits_total{cache_key_prefix="/api/products"} 5

# Память процесса
process_memory_usage_bytes{type="heapUsed"} 20655096
process_memory_usage_bytes{type="rss"} 146575360
```

## 🔧 Интеграция в код

### Добавление новых метрик
```typescript
// В services/metrics.ts
export const customCounter = new client.Counter({
  name: 'custom_events_total',
  help: 'Custom business events',
  labelNames: ['event_type']
});

// В коде приложения
import { customCounter } from '../services/metrics';
customCounter.inc({ event_type: 'order_created' });
```

### Отслеживание времени выполнения
```typescript
import { httpDuration } from '../services/metrics';

const timer = httpDuration.startTimer({ method: 'POST', route: '/api/orders' });
// ... выполнение операции
timer({ status: '200' });
```

## 🚨 Production рекомендации

### Retention и storage
- Prometheus: 15 дней (можно увеличить в конфиге)
- Метрики каждые 15 секунд
- Алерты каждые 15 секунд

### Ресурсы
- Prometheus: ~500MB RAM + хранилище
- Grafana: ~200MB RAM
- Backend метрики: минимальный overhead (<1% CPU)

### Безопасность
- Изменить пароль Grafana (admin/admin123)
- Настроить HTTPS для production
- Ограничить доступ к метрикам (firewall/VPN)

## 📚 Полезные PromQL запросы

```promql
# Топ endpoint'ов по времени ответа
topk(5, histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (route, le)))

# Процент ошибок
sum(rate(api_errors_total[5m])) / sum(rate(http_requests_total[5m])) * 100

# Рост пользователей за сутки
increase(user_registrations_total[24h])

# Популярные товары
topk(10, sum(rate(product_views_total[1h])) by (product_id))

# Эффективность кеша
sum(rate(cache_hits_total[5m])) / (sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m])))
```

---

🎉 **Мониторинг EcoBottle готов к production!**

Все метрики работают, dashboard настроен, алерты сконфигурированы. Система обеспечивает полную наблюдаемость приложения от HTTP запросов до бизнес-метрик.
