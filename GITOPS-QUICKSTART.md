# GitOps Quick Start Guide

Быстрый запуск GitOps для EcoBottle проекта.

## 🚀 За 5 минут до продакшена

### 1. Подготовка (1 мин)

```bash
# Клонируй репозиторий
git clone https://github.com/your-username/eco_bottle.git
cd eco_bottle

# Убедись что у тебя есть:
# - Kubernetes кластер
# - kubectl настроен
# - Helm установлен
```

### 2. Установи Argo CD (2 мин)

```bash
# Быстрая установка
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Получи пароль админа
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo

# Проброс порта для UI (опционально)
kubectl port-forward svc/argocd-server -n argocd 8080:443 &
```

### 3. Деплой приложения (2 мин)

```bash
# Обнови репозиторий в Application
sed -i 's/your-username/YOUR_GITHUB_USERNAME/' infra/argocd/api-application.yaml

# Применяй Application
kubectl apply -f infra/argocd/api-application.yaml

# Создай секреты
kubectl create namespace ecobottle
kubectl create secret generic ecobottle-secrets -n ecobottle \
  --from-literal=DATABASE_URL="postgresql://user:pass@postgres:5432/ecobottle" \
  --from-literal=JWT_SECRET="super-secret-jwt-key" \
  --from-literal=REDIS_URL="redis://redis:6379"
```

## 🔧 Конфигурация CI/CD

### GitHub Secrets

Добавь в Settings → Secrets and variables → Actions:

```
GITOPS_TOKEN = "github_pat_xxxxx"  # Personal Access Token с repo правами
```

### Container Registry

В `infra/helm/api/values.yaml` обнови:

```yaml
image:
  repository: ghcr.io/YOUR_USERNAME/eco_bottle/api
  tag: "latest"
```

## 📊 Vercel (Frontend)

1. Подключи репозиторий к Vercel
2. Добавь переменные окружения:

```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=super-secret-nextauth-key
NEXT_PUBLIC_API_BASE=https://api.your-domain.com
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
```

## 🎯 Workflow

1. **Пуш код** → GitHub
2. **CI билдит** образы → GitHub Container Registry  
3. **CI обновляет** теги в `values.yaml`
4. **Argo CD синхронизирует** → Kubernetes

## 🔍 Мониторинг

```bash
# Статус приложений Argo CD
kubectl get applications -n argocd

# Поды приложения
kubectl get pods -n ecobottle

# Логи
kubectl logs -l app.kubernetes.io/name=ecobottle-api -n ecobottle -f

# Метрики (если Prometheus установлен)
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
```

## 🔧 Полезные команды

```bash
# Принудительная синхронизация
kubectl patch app ecobottle-api -n argocd --type merge -p '{"operation":{"sync":{"revision":"HEAD"}}}'

# Перезапуск deployment
kubectl rollout restart deployment/ecobottle-api -n ecobottle

# Масштабирование
kubectl scale deployment/ecobottle-api --replicas=3 -n ecobottle

# Обновление секретов
kubectl create secret generic ecobottle-secrets -n ecobottle \
  --from-literal=NEW_VAR="new-value" \
  --dry-run=client -o yaml | kubectl apply -f -
```

## 🚨 Troubleshooting

**ImagePullBackOff?**
```bash
# Проверь образ
docker pull ghcr.io/your-username/eco_bottle/api:latest

# Проверь логи
kubectl describe pod -l app.kubernetes.io/name=ecobottle-api -n ecobottle
```

**Argo CD не синхронизируется?**
```bash
# Проверь статус
kubectl describe application ecobottle-api -n argocd

# Принудительная синхронизация
kubectl patch app ecobottle-api -n argocd --type merge -p '{"operation":{"sync":{"revision":"HEAD"}}}'
```

**База данных не подключается?**
```bash
# Проверь секреты
kubectl get secret ecobottle-secrets -n ecobottle -o yaml

# Тестовое подключение
kubectl run pg-test --rm -it --image=postgres:15 -n ecobottle -- psql $DATABASE_URL
```

## 📚 Дополнительно

- 📖 Полная документация: `infra/README.md`
- 🔧 Настройка мониторинга: `MONITORING.md`  
- 🐳 Docker Compose для разработки: `docker-compose.yml`
- 🔍 CI/CD статус: `CI-CD-STATUS.md`

---

🎉 **Готово!** Теперь у тебя GitOps как в Netflix, только лучше! 🚀
