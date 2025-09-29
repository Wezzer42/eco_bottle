#!/bin/bash

echo "🚀 Starting load test for EcoBottle metrics..."

API_BASE="http://localhost:4000"
METRICS_URL="http://localhost:9100/metrics"

# Функция для генерации нагрузки
generate_load() {
    local endpoint=$1
    local count=$2
    echo "📊 Making $count requests to $endpoint"
    
    for i in $(seq 1 $count); do
        curl -s "$API_BASE$endpoint" >/dev/null &
        if (( i % 10 == 0 )); then
            echo -n "."
        fi
    done
    wait
    echo " ✅ Done"
}

# Функция для показа метрик
show_metrics() {
    local metric_name=$1
    echo "📈 Current $metric_name:"
    curl -s $METRICS_URL | grep "$metric_name" | head -5
    echo ""
}

echo ""
echo "🔄 Generating mixed load..."

# Генерируем разную нагрузку
generate_load "/api/health" 20
generate_load "/api/products" 15
generate_load "/api/nonexistent" 5  # Для генерации 404 ошибок

echo ""
echo "📊 Current metrics:"
echo "=================="

# Показываем различные метрики
show_metrics "http_requests_total"
show_metrics "http_request_duration_ms"
show_metrics "process_memory_usage_bytes"
show_metrics "cache_hits_total"

# Тестируем авторизацию для генерации бизнес-метрик
echo "🔐 Testing auth endpoints..."
curl -s -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' >/dev/null

curl -s -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"wrong"}' >/dev/null

echo ""
show_metrics "user_logins_total"
show_metrics "api_errors_total"

echo "✅ Load test completed!"
echo ""
echo "🔍 View all metrics at: $METRICS_URL"
echo "📊 Prometheus (if running): http://localhost:9090"
echo "📈 Grafana (if running): http://localhost:3001 (admin/admin123)"
