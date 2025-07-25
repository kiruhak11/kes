# 🚀 Чек-лист для деплоя на продакшен

## ✅ Перед деплоем

### 1. Переменные окружения
Убедитесь, что установлены:
```bash
# .env.production
NODE_ENV=production
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
ADMIN_PASSWORD=secure_password
FILE_STORAGE_MOUNT=/var/www/uploads
```

### 2. Сборка проекта
```bash
# Установка зависимостей
npm ci --production

# Сборка для продакшена
npm run build

# Проверка сборки
npm run preview
```

### 3. Проверка оптимизаций
- ✅ Service Worker активен (`/sw.js` доступен)
- ✅ Критический CSS инжектится
- ✅ Изображения оптимизируются в WebP/AVIF
- ✅ Gzip/Brotli сжатие включено
- ✅ Кэширование настроено

## 🌐 Настройки сервера

### Nginx конфигурация
```nginx
server {
    listen 443 ssl http2;
    server_name kes-sib.ru;
    
    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Brotli сжатие (если доступно)
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Кэширование статических ресурсов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }
    
    # Кэширование HTML
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
    
    # Service Worker
    location /sw.js {
        expires 0;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # API кэширование
    location /api/ {
        expires 5m;
        add_header Cache-Control "public, must-revalidate";
        proxy_pass http://localhost:3000;
    }
    
    # Основное приложение
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 конфигурация
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'kes-sib',
    script: '.output/server/index.mjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NITRO_PRESET: 'node-server'
    },
    // Оптимизации для производительности
    node_args: '--max-old-space-size=2048',
    max_memory_restart: '1G',
    // Мониторинг
    monitoring: true,
    pmx: true
  }]
}
```

## 🔧 Финальные оптимизации

### 1. Проверьте размеры бандлов
```bash
# Анализ размеров
npx nuxi analyze

# Должно быть примерно:
# - Initial JS: < 100KB
# - CSS: < 50KB
# - Images: оптимизированы
```

### 2. Тест производительности
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage

# Ожидаемые результаты:
# Performance: 95+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 95+
```

### 3. Мониторинг в продакшене
```javascript
// Добавьте в .env.production
ENABLE_PERFORMANCE_MONITORING=true
ANALYTICS_ENDPOINT=https://your-analytics.com/api
```

## 🚀 Команды для деплоя

### Быстрый деплой
```bash
# 1. Сборка
npm run build

# 2. Запуск с PM2
pm2 start ecosystem.config.js

# 3. Сохранение конфигурации PM2
pm2 save
pm2 startup
```

### Docker деплой
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

```bash
# Сборка и запуск
docker build -t kes-sib .
docker run -d -p 3000:3000 --name kes-sib-app kes-sib
```

## 📊 Мониторинг после деплоя

### 1. Проверьте метрики
- Откройте DevTools → Console
- Должны появиться логи: `🚀 Все оптимизации активированы!`
- Проверьте Web Vitals в консоли

### 2. Тестирование
```bash
# PageSpeed Insights
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://kes-sib.ru"

# GTmetrix
# Зайдите на gtmetrix.com и протестируйте сайт
```

### 3. Мониторинг ошибок
- Настройте Sentry или аналогичный сервис
- Мониторьте логи PM2: `pm2 logs`
- Проверяйте метрики сервера

## 🎯 Ожидаемые результаты

После деплоя ваш сайт должен показывать:

### Lighthouse Score
- **Performance**: 95-100 🚀
- **Accessibility**: 95-100 ♿
- **Best Practices**: 95-100 ✅
- **SEO**: 95-100 🔍

### Web Vitals
- **FCP**: < 1.0s ⚡
- **LCP**: < 1.5s 🖼️
- **FID**: < 50ms ⚡
- **CLS**: < 0.05 📐

### Размеры
- **Initial Bundle**: < 100KB 📦
- **Images**: WebP/AVIF оптимизация 🖼️
- **Fonts**: Оптимизированная загрузка 🔤

## 🆘 Troubleshooting

### Если что-то не работает:

1. **Service Worker не активируется**
   ```bash
   # Проверьте доступность
   curl https://kes-sib.ru/sw.js
   ```

2. **Медленная загрузка**
   ```bash
   # Проверьте сжатие
   curl -H "Accept-Encoding: gzip" -I https://kes-sib.ru
   ```

3. **Ошибки в консоли**
   ```bash
   # Проверьте логи
   pm2 logs kes-sib
   ```

---

## ✅ Финальная проверка

- [ ] Сборка прошла успешно
- [ ] Service Worker активен
- [ ] Gzip/Brotli включен
- [ ] Кэширование настроено
- [ ] Мониторинг работает
- [ ] Performance Score > 95
- [ ] Все оптимизации активны

**Готово! Ваш сайт теперь летает как ракета! 🚀**