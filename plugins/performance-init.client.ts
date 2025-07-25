export default defineNuxtPlugin(() => {
  if (process.client) {
    console.log('🚀 Инициализация супер-оптимизированного сайта...');
    
    // Инициализируем все композаблы для максимальной производительности
    const { startMonitoring } = usePerformanceMonitor();
    const { triggerCleanup } = useMemoryOptimization();
    const { injectCriticalCSS } = useCriticalCSS();
    const { optimizedFetch, preloadData } = useAPIOptimization();

    // Критические оптимизации - выполняем немедленно
    const initCriticalOptimizations = () => {
      // Инжектим критический CSS
      injectCriticalCSS();
      
      // Предзагружаем критические данные
      preloadData([
        '/api/categories',
        '/api/products/featured',
      ]);
      
      // Оптимизируем viewport для мобильных
      if (window.innerWidth < 768) {
        document.documentElement.classList.add('mobile-optimized');
      }
      
      // Отключаем анимации на слабых устройствах
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.documentElement.classList.add('low-performance');
      }
    };

    // Некритические оптимизации - выполняем при idle
    const initNonCriticalOptimizations = () => {
      // Запускаем мониторинг производительности
      startMonitoring();
      
      // Настраиваем периодическую очистку памяти
      setInterval(triggerCleanup, 300000); // Каждые 5 минут
      
      // Оптимизируем изображения
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach((img) => {
        img.setAttribute('decoding', 'async');
      });
      
      // Настраиваем предзагрузку при hover
      document.addEventListener('mouseover', (e) => {
        const link = (e.target as HTMLElement).closest('a[href^="/"]') as HTMLAnchorElement;
        if (link && !link.dataset.preloaded) {
          link.dataset.preloaded = 'true';
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = link.href;
          document.head.appendChild(prefetchLink);
        }
      }, { passive: true });
    };

    // Выполняем критические оптимизации немедленно
    initCriticalOptimizations();
    
    // Выполняем некритические оптимизации при idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initNonCriticalOptimizations, { timeout: 2000 });
    } else {
      setTimeout(initNonCriticalOptimizations, 100);
    }
    
    // Логируем успешную инициализацию
    console.log('✅ Все оптимизации активированы! Сайт готов к полету! 🚀');
    
    // Показываем статистику через 3 секунды
    setTimeout(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        console.log(`🎨 First Contentful Paint: ${fcp.startTime.toFixed(2)}ms`);
      }
      
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const domReady = navigation.domContentLoadedEventEnd - navigation.navigationStart;
        console.log(`📄 DOM Ready: ${domReady.toFixed(2)}ms`);
      }
    }, 3000);
  }
});