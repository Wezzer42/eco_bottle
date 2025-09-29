# EcoBottle CI/CD Pipeline

Данная папка содержит настройки для автоматизации разработки проекта EcoBottle.

## Workflows

### 🚀 Main CI/CD Pipeline (`ci.yml`)
- **Триггеры**: Push в `main`/`develop`, Pull Requests в `main`
- **Этапы**:
  1. **Lint & Test** - Проверка кода и тесты
  2. **Security Scan** - Сканирование уязвимостей
  3. **Build Images** - Сборка Docker образов
  4. **Deploy** - Деплой на production (только для `main`)

### 🧪 Tests (`test.yml`)
- **Unit Tests** - Юнит тесты для backend и frontend
- **Integration Tests** - Интеграционные тесты API и E2E

### 📊 Load Testing (`load-test.yml`)
- **Триггеры**: Расписание (каждую ночь) или ручной запуск
- **Artillery** - Нагрузочное тестирование API

### 🔒 Security Analysis (`codeql.yml`)
- **CodeQL** - Статический анализ кода
- **Триггеры**: Push, PR, еженедельное расписание

## Services

Все workflows используют следующие сервисы:
- **PostgreSQL 16** - База данных для тестов
- **Redis 7** - Кеширование для тестов

## Переменные окружения

### Обязательные для CI:
```bash
DATABASE_URL=postgresql://testuser:testpass@localhost:5432/testdb
REDIS_URL=redis://localhost:6379
JWT_SECRET=test-secret-key
```

### Для production деплоя:
```bash
GITHUB_TOKEN  # Автоматически доступен
```

## Docker Images

Образы публикуются в GitHub Container Registry:
- `ghcr.io/username/eco_bottle/backend:latest`
- `ghcr.io/username/eco_bottle/frontend:latest`

## Dependabot

Автоматические обновления зависимостей:
- **Backend npm** - Еженедельно по понедельникам
- **Frontend npm** - Еженедельно по понедельникам  
- **GitHub Actions** - Ежемесячно

## Использование

1. **Локальная разработка**:
   ```bash
   # Запуск тестов как в CI
   npm test
   npm run lint
   npm run type-check
   ```

2. **Тестирование Docker образов**:
   ```bash
   docker-compose -f docker-compose.ci.yml up --build
   ```

3. **Ручной запуск load тестов**:
   - Перейти в Actions → Load Testing → Run workflow

## Статусы

- ✅ **CI Setup** - Основной pipeline настроен
- ✅ **Tests** - Unit и Integration тесты
- ✅ **Docker** - Сборка образов
- ✅ **Security** - CodeQL и сканирование зависимостей
- 🔄 **Deploy** - В разработке (требует настройки target сервера)
