export const useCriticalCSS = () => {
  const criticalStyles = ref('');
  const nonCriticalStyles = ref<string[]>([]);
  const isStylesLoaded = ref(false);

  // Критические стили для первого экрана
  const injectCriticalCSS = () => {
    if (process.client) {
      const critical = `
        /* Критические стили для мгновенного рендеринга */
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        /* Скелетон для загрузки */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        /* Критические компоненты */
        .header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #fff;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: #e31e24;
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-primary {
          background: #e31e24;
          color: white;
        }
        
        .btn-primary:hover {
          background: #c41e3a;
        }
        
        /* Скрытие некритичных элементов до загрузки */
        .non-critical {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .non-critical.loaded {
          opacity: 1;
        }
        
        /* Оптимизация шрифтов */
        .fonts-loading body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .fonts-loaded body {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `;

      // Инжектим критические стили
      const style = document.createElement('style');
      style.textContent = critical;
      style.setAttribute('data-critical', 'true');
      document.head.insertBefore(style, document.head.firstChild);
      
      criticalStyles.value = critical;
    }
  };

  // Ленивая загрузка некритичных стилей
  const loadNonCriticalCSS = (stylesheets: string[]) => {
    if (process.client) {
      const loadPromises = stylesheets.map((href) => {
        return new Promise<void>((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          link.media = 'print'; // Загружаем как print, потом меняем
          link.onload = () => {
            link.media = 'all';
            resolve();
          };
          link.onerror = reject;
          document.head.appendChild(link);
        });
      });

      Promise.all(loadPromises).then(() => {
        isStylesLoaded.value = true;
        
        // Показываем некритичные элементы
        document.querySelectorAll('.non-critical').forEach((el) => {
          el.classList.add('loaded');
        });
      });

      nonCriticalStyles.value = stylesheets;
    }
  };

  // Предзагрузка CSS для следующих страниц
  const preloadCSS = (href: string) => {
    if (process.client) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    }
  };

  // Удаление неиспользуемых стилей
  const removeUnusedCSS = () => {
    if (process.client) {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      stylesheets.forEach((stylesheet) => {
        const href = (stylesheet as HTMLLinkElement).href;
        
        // Проверяем, используются ли стили с этой страницы
        if (href.includes('page-specific') && !href.includes(window.location.pathname)) {
          stylesheet.remove();
        }
      });
    }
  };

  // Оптимизация CSS для мобильных устройств
  const optimizeForMobile = () => {
    if (process.client && window.innerWidth < 768) {
      const mobileCSS = `
        /* Мобильные оптимизации */
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        body {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        
        img {
          max-width: 100%;
          height: auto;
        }
        
        /* Отключаем анимации на слабых устройствах */
        @media (max-width: 768px) and (prefers-reduced-motion: no-preference) {
          .animate-on-scroll {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `;

      const style = document.createElement('style');
      style.textContent = mobileCSS;
      style.setAttribute('data-mobile', 'true');
      document.head.appendChild(style);
    }
  };

  // Инлайн критических стилей для компонентов
  const inlineComponentStyles = (component: string, styles: string) => {
    if (process.client) {
      const existingStyle = document.querySelector(`[data-component="${component}"]`);
      if (!existingStyle) {
        const style = document.createElement('style');
        style.textContent = styles;
        style.setAttribute('data-component', component);
        document.head.appendChild(style);
      }
    }
  };

  // Мониторинг производительности CSS
  const measureCSSPerformance = () => {
    if (process.client && 'performance' in window) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      const lcp = paintEntries.find(entry => entry.name === 'largest-contentful-paint');
      
      if (fcp) {
        console.log(`First Contentful Paint: ${fcp.startTime}ms`);
      }
      
      if (lcp) {
        console.log(`Largest Contentful Paint: ${lcp.startTime}ms`);
      }
    }
  };

  // Инициализация
  onMounted(() => {
    injectCriticalCSS();
    optimizeForMobile();
    
    // Загружаем некритичные стили после загрузки страницы
    nextTick(() => {
      if (process.client) {
        // Используем requestIdleCallback для загрузки некритичных стилей
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            measureCSSPerformance();
          });
        }
      }
    });
  });

  return {
    criticalStyles: readonly(criticalStyles),
    nonCriticalStyles: readonly(nonCriticalStyles),
    isStylesLoaded: readonly(isStylesLoaded),
    loadNonCriticalCSS,
    preloadCSS,
    removeUnusedCSS,
    inlineComponentStyles,
    measureCSSPerformance,
  };
};