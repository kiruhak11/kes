export default defineNuxtPlugin(() => {
  if (process.client) {
    // Оптимизация загрузки ресурсов
    const optimizeResourceLoading = () => {
      // Приоритизация критических ресурсов
      const criticalResources = [
        { href: '/api/categories', as: 'fetch', priority: 'high' },
        { href: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2', as: 'font', priority: 'high' },
      ];

      criticalResources.forEach(({ href, as, priority }) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        if (priority) {
          link.setAttribute('fetchpriority', priority);
        }
        if (as === 'font') {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      });

      // DNS предзагрузка для внешних ресурсов
      const dnsPrefetch = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://api.example.com',
      ];

      dnsPrefetch.forEach((domain) => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
      });
    };

    // Адаптивная загрузка на основе соединения
    const adaptiveLoading = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        const { effectiveType, downlink, rtt } = connection;
        
        // Настройки для разных типов соединения
        const connectionSettings = {
          'slow-2g': { imageQuality: 60, prefetchLimit: 2, lazyThreshold: 100 },
          '2g': { imageQuality: 70, prefetchLimit: 3, lazyThreshold: 200 },
          '3g': { imageQuality: 80, prefetchLimit: 5, lazyThreshold: 400 },
          '4g': { imageQuality: 90, prefetchLimit: 10, lazyThreshold: 800 },
        };

        const settings = connectionSettings[effectiveType as keyof typeof connectionSettings] || connectionSettings['4g'];
        
        // Применяем настройки
        document.documentElement.style.setProperty('--image-quality', settings.imageQuality.toString());
        document.documentElement.style.setProperty('--prefetch-limit', settings.prefetchLimit.toString());
        document.documentElement.style.setProperty('--lazy-threshold', `${settings.lazyThreshold}px`);
        
        // Добавляем класс для CSS оптимизаций
        document.documentElement.classList.add(`connection-${effectiveType}`);
        
        console.log(`Connection: ${effectiveType}, Downlink: ${downlink}Mbps, RTT: ${rtt}ms`);
      }
    };

    // Оптимизация изображений на лету
    const optimizeImages = () => {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            
            // Определяем оптимальный размер
            const rect = img.getBoundingClientRect();
            const devicePixelRatio = window.devicePixelRatio || 1;
            const optimalWidth = Math.ceil(rect.width * devicePixelRatio);
            const optimalHeight = Math.ceil(rect.height * devicePixelRatio);
            
            // Обновляем src с оптимальными параметрами
            if (img.dataset.src) {
              let optimizedSrc = img.dataset.src;
              
              // Добавляем параметры оптимизации
              const url = new URL(optimizedSrc, window.location.origin);
              url.searchParams.set('w', optimalWidth.toString());
              url.searchParams.set('h', optimalHeight.toString());
              url.searchParams.set('q', '85');
              url.searchParams.set('f', 'webp');
              
              img.src = url.toString();
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01,
      });

      // Наблюдаем за всеми изображениями с data-src
      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });
    };

    // Предзагрузка на основе пользовательского поведения
    const behaviorBasedPreload = () => {
      let mouseIdleTimer: NodeJS.Timeout;
      let lastMouseMove = Date.now();
      
      const preloadOnIdle = () => {
        const idleTime = Date.now() - lastMouseMove;
        if (idleTime > 2000) { // 2 секунды бездействия
          // Предзагружаем популярные страницы
          const popularPages = ['/catalog', '/about', '/contacts'];
          popularPages.forEach((page) => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            document.head.appendChild(link);
          });
        }
      };

      document.addEventListener('mousemove', () => {
        lastMouseMove = Date.now();
        clearTimeout(mouseIdleTimer);
        mouseIdleTimer = setTimeout(preloadOnIdle, 2000);
      }, { passive: true });

      // Предзагрузка при наведении на ссылки
      document.addEventListener('mouseover', (e) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a[href]') as HTMLAnchorElement;
        
        if (link && link.href.startsWith(window.location.origin)) {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = link.href;
          document.head.appendChild(prefetchLink);
        }
      }, { passive: true });
    };

    // Оптимизация скриптов
    const optimizeScripts = () => {
      // Ленивая загрузка некритичных скриптов
      const lazyScripts = [
        { src: '/js/analytics.js', condition: () => !navigator.doNotTrack },
        { src: '/js/chat-widget.js', condition: () => window.innerWidth > 768 },
      ];

      const loadScript = (src: string) => {
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };

      // Загружаем скрипты при idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          lazyScripts.forEach(({ src, condition }) => {
            if (condition()) {
              loadScript(src).catch(() => {
                console.warn(`Failed to load script: ${src}`);
              });
            }
          });
        });
      }
    };

    // Мониторинг производительности
    const monitorPerformance = () => {
      // Web Vitals мониторинг
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log(`LCP: ${entry.startTime}ms`);
          }
          if (entry.entryType === 'first-input') {
            console.log(`FID: ${(entry as any).processingStart - entry.startTime}ms`);
          }
          if (entry.entryType === 'layout-shift') {
            console.log(`CLS: ${(entry as any).value}`);
          }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

      // Мониторинг ресурсов
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resource = entry as PerformanceResourceTiming;
          if (resource.duration > 1000) {
            console.warn(`Slow resource: ${resource.name} (${resource.duration}ms)`);
          }
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
    };

    // Инициализация всех оптимизаций
    const init = () => {
      optimizeResourceLoading();
      adaptiveLoading();
      optimizeImages();
      behaviorBasedPreload();
      optimizeScripts();
      monitorPerformance();
    };

    // Запускаем оптимизации
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
});