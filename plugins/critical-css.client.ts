export default defineNuxtPlugin(() => {
  // Отключаем критический CSS - он конфликтует с основными стилями
  // Оставляем только базовую инициализацию
  if (process.client) {
    console.log('🎨 CSS плагин инициализирован');
  }
});