#!/bin/bash

# 🔧 Скрипт для исправления проблем на продакшене

echo "🔧 Исправление проблем на продакшене..."

# 1. Очистка старой сборки
echo "🧹 Очистка старой сборки..."
rm -rf .nuxt .output

# 2. Пересборка с правильными настройками
echo "🏗️ Пересборка проекта..."
NODE_ENV=production npm run build

# 3. Проверка файлов сборки
echo "📋 Проверка файлов сборки..."
if [ -d ".output/public/_nuxt" ]; then
    echo "✅ Папка _nuxt найдена"
    
    # Проверяем CSS файлы
    CSS_COUNT=$(find .output/public/_nuxt -name "*.css" | wc -l)
    JS_COUNT=$(find .output/public/_nuxt -name "*.js" | wc -l)
    
    echo "📊 Найдено файлов:"
    echo "   CSS: $CSS_COUNT"
    echo "   JS: $JS_COUNT"
    
    if [ $CSS_COUNT -gt 0 ] && [ $JS_COUNT -gt 0 ]; then
        echo "✅ Файлы сборки в порядке"
    else
        echo "❌ Проблема с файлами сборки"
        exit 1
    fi
else
    echo "❌ Папка _nuxt не найдена!"
    exit 1
fi

# 4. Создание правильной структуры для Nginx
echo "📁 Настройка структуры для Nginx..."
mkdir -p public/_nuxt
if [ -d ".output/public/_nuxt" ]; then
    cp -r .output/public/_nuxt/* public/_nuxt/ 2>/dev/null || true
fi

# 5. Проверка MIME типов в файлах
echo "🔍 Проверка содержимого файлов..."
for file in .output/public/_nuxt/*.css; do
    if [ -f "$file" ]; then
        # Проверяем, что CSS файл содержит CSS, а не JSON
        if grep -q "^{" "$file"; then
            echo "⚠️  Внимание: $file содержит JSON вместо CSS"
        else
            echo "✅ $file - корректный CSS"
        fi
    fi
done

# 6. Создание .htaccess для Apache (если используется)
echo "📝 Создание .htaccess..."
cat > .output/public/.htaccess << 'EOF'
# Правильные MIME типы
<FilesMatch "\.css$">
    Header set Content-Type "text/css; charset=utf-8"
</FilesMatch>

<FilesMatch "\.js$">
    Header set Content-Type "application/javascript; charset=utf-8"
</FilesMatch>

# Кэширование
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header append Cache-Control "public, immutable"
</FilesMatch>

# Gzip сжатие
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
EOF

echo ""
echo "🎉 ИСПРАВЛЕНИЕ ЗАВЕРШЕНО!"
echo "=========================="
echo ""
echo "📋 Что сделано:"
echo "✅ Очищена старая сборка"
echo "✅ Пересобран проект"
echo "✅ Проверены файлы сборки"
echo "✅ Создан .htaccess"
echo ""
echo "🚀 Следующие шаги:"
echo "1. Скопируйте .output/ на сервер"
echo "2. Настройте Nginx согласно nginx.conf"
echo "3. Перезапустите веб-сервер"
echo "4. Проверьте сайт в браузере"
echo ""
echo "🔧 Если проблемы остались:"
echo "• Проверьте настройки Nginx/Apache"
echo "• Убедитесь, что MIME типы настроены правильно"
echo "• Очистите кэш браузера (Ctrl+F5)"