export default defineNuxtPlugin(() => {
  if (process.client) {
    console.log('🚀 Инициализация оптимизированного сайта...');
    
    // Легкие оптимизации - не ломаем функциональность
    const initLightOptimizations = () => {
      // Оптимизируем viewport для мобильных
      if (window.innerWidth < 768) {
        document.documentElement.classList.add('mobile-optimized');
      }
      
      // Отключаем анимации на слабых устройствах
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.documentElement.classList.add('low-performance');
      }
    };

    // Выполняем легкие оптимизации
    initLightOptimizations();
    
    // Логируем успешную инициализацию
    console.log('✅ Оптимизации активированы! 🚀');
  }
});