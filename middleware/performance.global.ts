export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    // Предзагрузка критических ресурсов для следующей страницы
    const preloadForRoute = (path: string) => {
      const routePreloads: Record<string, string[]> = {
        '/': ['/api/categories', '/api/products/featured'],
        '/catalog': ['/api/categories', '/api/products/list'],
        '/about': [],
        '/contacts': [],
      };

      const preloads = routePreloads[path] || [];
      preloads.forEach((url) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    };

    // Очистка неиспользуемых ресурсов при смене маршрута
    const cleanupResources = () => {
      // Удаляем старые prefetch ссылки
      const oldPrefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
      oldPrefetchLinks.forEach((link) => {
        if (link.getAttribute('href')?.startsWith('/api/')) {
          link.remove();
        }
      });

      // Очищаем неиспользуемые изображения из кэша
      if ('caches' in window) {
        caches.open('images').then((cache) => {
          // Логика очистки кэша изображений
        });
      }
    };

    // Оптимизация для мобильных устройств
    const optimizeForMobile = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Отключаем некритичные анимации на мобильных
        document.documentElement.classList.add('mobile-optimized');
        
        // Уменьшаем качество изображений на медленных соединениях
        const connection = (navigator as any).connection;
        if (connection && connection.effectiveType === '2g') {
          document.documentElement.classList.add('slow-connection');
        }
      }
    };

    // Мониторинг производительности
    const monitorPerformance = () => {
      if ('performance' in window && 'measure' in performance) {
        performance.mark('route-start');
        
        nextTick(() => {
          performance.mark('route-end');
          performance.measure('route-transition', 'route-start', 'route-end');
          
          const measure = performance.getEntriesByName('route-transition')[0];
          if (measure && measure.duration > 1000) {
            console.warn(`Slow route transition: ${measure.duration}ms to ${to.path}`);
          }
        });
      }
    };

    // Выполняем оптимизации
    if (to.path !== from.path) {
      cleanupResources();
      preloadForRoute(to.path);
      optimizeForMobile();
      monitorPerformance();
    }
  }
});