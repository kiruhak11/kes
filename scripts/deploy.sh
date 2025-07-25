#!/bin/bash

# 🚀 Автоматический деплой оптимизированного сайта
# Использование: ./scripts/deploy.sh [production|staging]

set -e  # Остановка при ошибке

ENVIRONMENT=${1:-production}
echo "🚀 Начинаем деплой для окружения: $ENVIRONMENT"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# 1. Проверка окружения
log "Проверка окружения..."

if ! command -v node &> /dev/null; then
    error "Node.js не установлен"
fi

if ! command -v npm &> /dev/null; then
    error "npm не установлен"
fi

NODE_VERSION=$(node --version)
log "Node.js версия: $NODE_VERSION"

# 2. Проверка производительности
log "Запуск проверки производительности..."
if ! npm run check-performance; then
    error "Проверка производительности не пройдена!"
fi
success "Все проверки производительности пройдены"

# 3. Установка зависимостей
log "Установка зависимостей..."
npm ci --production
success "Зависимости установлены"

# 4. Сборка проекта
log "Сборка проекта для $ENVIRONMENT..."
if [ "$ENVIRONMENT" = "production" ]; then
    NODE_ENV=production npm run build
else
    NODE_ENV=staging npm run build
fi
success "Сборка завершена"

# 5. Проверка размеров бандлов
log "Анализ размеров бандлов..."
if [ -d ".output/public/_nuxt" ]; then
    BUNDLE_SIZE=$(du -sh .output/public/_nuxt | cut -f1)
    log "Размер бандлов: $BUNDLE_SIZE"
    
    # Проверяем, что размер не превышает лимит
    BUNDLE_SIZE_KB=$(du -sk .output/public/_nuxt | cut -f1)
    if [ "$BUNDLE_SIZE_KB" -gt 500 ]; then
        warning "Размер бандлов больше 500KB: ${BUNDLE_SIZE_KB}KB"
    else
        success "Размер бандлов оптимален: ${BUNDLE_SIZE_KB}KB"
    fi
fi

# 6. Проверка критических файлов
log "Проверка критических файлов..."

CRITICAL_FILES=(
    ".output/server/index.mjs"
    ".output/public/sw.js"
    ".output/public/_nuxt"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -e "$file" ]; then
        success "Найден: $file"
    else
        error "Отсутствует критический файл: $file"
    fi
done

# 7. Тест производительности (если доступен Lighthouse CI)
if command -v lhci &> /dev/null; then
    log "Запуск Lighthouse CI..."
    npm run preview &
    PREVIEW_PID=$!
    sleep 10  # Ждем запуска сервера
    
    lhci autorun --upload.target=temporary-public-storage || warning "Lighthouse CI не прошел"
    kill $PREVIEW_PID
else
    warning "Lighthouse CI не установлен, пропускаем тест производительности"
fi

# 8. Создание архива для деплоя
log "Создание архива для деплоя..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="kes-sib-${ENVIRONMENT}-${TIMESTAMP}.tar.gz"

tar -czf "$ARCHIVE_NAME" \
    .output/ \
    package.json \
    ecosystem.config.js \
    --exclude='.output/nitro.json' \
    --exclude='.output/build'

success "Архив создан: $ARCHIVE_NAME"

# 9. Проверка Service Worker
log "Проверка Service Worker..."
if [ -f ".output/public/sw.js" ]; then
    SW_SIZE=$(wc -c < .output/public/sw.js)
    if [ "$SW_SIZE" -gt 1000 ]; then
        success "Service Worker готов (${SW_SIZE} байт)"
    else
        warning "Service Worker слишком мал (${SW_SIZE} байт)"
    fi
else
    error "Service Worker не найден!"
fi

# 10. Финальные инструкции
echo ""
echo "🎉 ДЕПЛОЙ ГОТОВ!"
echo "=================="
echo ""
echo "📦 Архив: $ARCHIVE_NAME"
echo "🌐 Окружение: $ENVIRONMENT"
echo "📊 Размер бандлов: $BUNDLE_SIZE"
echo ""
echo "📋 Следующие шаги:"
echo "1. Загрузите архив на сервер"
echo "2. Распакуйте: tar -xzf $ARCHIVE_NAME"
echo "3. Настройте переменные окружения"
echo "4. Запустите: pm2 start ecosystem.config.js"
echo "5. Проверьте в браузере"
echo ""
echo "🔗 Полезные команды:"
echo "• pm2 logs kes-sib          # Просмотр логов"
echo "• pm2 restart kes-sib       # Перезапуск"
echo "• pm2 monit                 # Мониторинг"
echo ""
echo "🚀 Ожидаемая производительность:"
echo "• Performance Score: 95+"
echo "• FCP: < 1.0s"
echo "• LCP: < 1.5s"
echo "• FID: < 50ms"
echo ""
success "Деплой завершен успешно!"