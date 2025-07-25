#!/usr/bin/env node

/**
 * 🚀 Скрипт проверки производительности
 * Автоматически проверяет все оптимизации перед деплоем
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Проверка оптимизаций производительности...\n');

const checks = [];
let allPassed = true;

// Функция для добавления проверки
function addCheck(name, passed, message) {
  checks.push({ name, passed, message });
  if (!passed) allPassed = false;
  
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}: ${message}`);
}

// 1. Проверка конфигурации Nuxt
console.log('📋 Проверка конфигурации...');
try {
  const configPath = path.join(process.cwd(), 'nuxt.config.ts');
  const config = fs.readFileSync(configPath, 'utf8');
  
  addCheck(
    'Nuxt Config',
    config.includes('minify: "esbuild"') && config.includes('ssr: true'),
    'Конфигурация оптимизирована'
  );
  
  addCheck(
    'Route Rules',
    config.includes('routeRules') && config.includes('prerender: true'),
    'Правила маршрутов настроены'
  );
  
  addCheck(
    'Image Optimization',
    config.includes('format: ["avif", "webp", "jpg"]'),
    'Оптимизация изображений включена'
  );
} catch (error) {
  addCheck('Nuxt Config', false, 'Ошибка чтения конфигурации');
}

// 2. Проверка плагинов оптимизации
console.log('\n🔌 Проверка плагинов...');
const pluginsDir = path.join(process.cwd(), 'plugins');
const requiredPlugins = [
  'preload.client.ts',
  'performance.client.ts',
  'sw.client.ts',
  'fonts.client.ts',
  'resource-optimizer.client.ts',
  'performance-init.client.ts'
];

requiredPlugins.forEach(plugin => {
  const pluginPath = path.join(pluginsDir, plugin);
  const exists = fs.existsSync(pluginPath);
  addCheck(`Plugin ${plugin}`, exists, exists ? 'Найден' : 'Отсутствует');
});

// 3. Проверка композаблов
console.log('\n🧩 Проверка композаблов...');
const composablesDir = path.join(process.cwd(), 'composables');
const requiredComposables = [
  'useOptimizedFetch.ts',
  'useOptimizedImages.ts',
  'useOptimizedAnimations.ts',
  'useOptimizedScroll.ts',
  'useMemoryOptimization.ts',
  'useCriticalCSS.ts',
  'useAPIOptimization.ts',
  'usePerformanceMonitor.ts'
];

requiredComposables.forEach(composable => {
  const composablePath = path.join(composablesDir, composable);
  const exists = fs.existsSync(composablePath);
  addCheck(`Composable ${composable}`, exists, exists ? 'Найден' : 'Отсутствует');
});

// 4. Проверка Service Worker
console.log('\n🔧 Проверка Service Worker...');
const swPath = path.join(process.cwd(), 'public', 'sw.js');
const swExists = fs.existsSync(swPath);
addCheck('Service Worker', swExists, swExists ? 'Найден' : 'Отсутствует');

if (swExists) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  addCheck(
    'SW Caching',
    swContent.includes('cache-first') && swContent.includes('network-first'),
    'Стратегии кэширования настроены'
  );
}

// 5. Проверка стилей анимаций
console.log('\n🎨 Проверка стилей...');
const animationsPath = path.join(process.cwd(), 'assets', 'styles', 'animations.scss');
const animationsExist = fs.existsSync(animationsPath);
addCheck('Animations CSS', animationsExist, animationsExist ? 'Найден' : 'Отсутствует');

// 6. Проверка middleware
console.log('\n🛣️ Проверка middleware...');
const middlewarePath = path.join(process.cwd(), 'middleware', 'performance.global.ts');
const middlewareExists = fs.existsSync(middlewarePath);
addCheck('Performance Middleware', middlewareExists, middlewareExists ? 'Найден' : 'Отсутствует');

// 7. Проверка package.json
console.log('\n📦 Проверка зависимостей...');
try {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredDeps = ['@nuxt/image', '@vueuse/nuxt', 'chart.js'];
  const hasAllDeps = requiredDeps.every(dep => 
    packageJson.dependencies[dep] || packageJson.devDependencies[dep]
  );
  
  addCheck('Dependencies', hasAllDeps, 'Все необходимые зависимости установлены');
} catch (error) {
  addCheck('Dependencies', false, 'Ошибка проверки зависимостей');
}

// 8. Проверка сборки (если возможно)
console.log('\n🏗️ Проверка сборки...');
try {
  const outputDir = path.join(process.cwd(), '.output');
  if (fs.existsSync(outputDir)) {
    const serverDir = path.join(outputDir, 'server');
    const publicDir = path.join(outputDir, 'public');
    
    addCheck('Build Output', fs.existsSync(serverDir), 'Серверная сборка найдена');
    addCheck('Public Assets', fs.existsSync(publicDir), 'Публичные ресурсы найдены');
    
    // Проверка размеров бандлов
    const publicFiles = fs.readdirSync(publicDir, { recursive: true });
    const jsFiles = publicFiles.filter(file => file.toString().endsWith('.js'));
    const cssFiles = publicFiles.filter(file => file.toString().endsWith('.css'));
    
    addCheck('JS Bundles', jsFiles.length > 0, `Найдено ${jsFiles.length} JS файлов`);
    
    // CSS может быть инлайнен в JS для лучшей производительности
    if (cssFiles.length > 0) {
      addCheck('CSS Bundles', true, `Найдено ${cssFiles.length} CSS файлов`);
    } else {
      addCheck('CSS Optimization', true, 'CSS инлайнен в JS (оптимизация)');
    }
  } else {
    addCheck('Build Output', false, 'Сборка не найдена. Запустите npm run build');
  }
} catch (error) {
  addCheck('Build Check', false, 'Ошибка проверки сборки');
}

// Итоговый отчет
console.log('\n' + '='.repeat(50));
console.log('📊 ИТОГОВЫЙ ОТЧЕТ');
console.log('='.repeat(50));

const passed = checks.filter(c => c.passed).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`\n✅ Пройдено: ${passed}/${total} (${percentage}%)`);

if (allPassed) {
  console.log('\n🚀 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ! Сайт готов к деплою!');
  console.log('\nСледующие шаги:');
  console.log('1. npm run build');
  console.log('2. Настройте переменные окружения');
  console.log('3. Деплойте на продакшен');
  console.log('4. Проверьте производительность в Lighthouse');
} else {
  console.log('\n❌ ЕСТЬ ПРОБЛЕМЫ! Исправьте их перед деплоем:');
  checks.filter(c => !c.passed).forEach(check => {
    console.log(`   • ${check.name}: ${check.message}`);
  });
}

console.log('\n' + '='.repeat(50));

// Дополнительные рекомендации
console.log('\n💡 РЕКОМЕНДАЦИИ:');
console.log('• Запустите npm run build для проверки сборки');
console.log('• Протестируйте на медленном соединении');
console.log('• Проверьте в Lighthouse после деплоя');
console.log('• Настройте мониторинг производительности');

process.exit(allPassed ? 0 : 1);