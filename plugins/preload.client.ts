export default defineNuxtPlugin(() => {
  // Кэш для предзагруженных ресурсов
  const preloadedResources = new Set<string>();
  
  // Предзагрузка критических ресурсов с приоритетом
  const preloadCriticalResources = () => {
    // Критические шрифты с высоким приоритетом
    const fontLink = document.createElement("link");
    fontLink.rel = "preload";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap";
    fontLink.as = "style";
    fontLink.crossOrigin = "anonymous";
    document.head.appendChild(fontLink);

    // Критические изображения
    const criticalImages = [
      "/images/logo.png",
      "/images/hero-bg.jpg",
    ];

    criticalImages.forEach((src) => {
      if (!preloadedResources.has(src)) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.href = src;
        link.as = "image";
        link.fetchPriority = "high";
        document.head.appendChild(link);
        preloadedResources.add(src);
      }
    });
  };

  // Умная предзагрузка на основе пользовательского поведения
  const smartPreload = (url: string) => {
    if (!preloadedResources.has(url)) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      document.head.appendChild(link);
      preloadedResources.add(url);
    }
  };

  // Предзагрузка при наведении (intersection observer для производительности)
  const setupHoverPreload = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          if (link.href && !preloadedResources.has(link.href)) {
            // Предзагружаем при появлении в viewport
            link.addEventListener('mouseenter', () => {
              smartPreload(link.href);
            }, { once: true });
          }
        }
      });
    }, { rootMargin: '50px' });

    // Наблюдаем за всеми ссылками
    document.querySelectorAll('a[href^="/"]').forEach((link) => {
      observer.observe(link);
    });
  };

  // Предзагрузка API данных
  const preloadAPIData = (route: string) => {
    const apiRoutes = {
      '/catalog': ['/api/categories', '/api/products/featured'],
      '/': ['/api/categories', '/api/products/popular'],
    };

    const apis = apiRoutes[route as keyof typeof apiRoutes];
    if (apis) {
      apis.forEach((api) => {
        if (!preloadedResources.has(api)) {
          fetch(api, { 
            method: 'GET',
            headers: { 'X-Preload': 'true' }
          }).catch(() => {}); // Тихо игнорируем ошибки предзагрузки
          preloadedResources.add(api);
        }
      });
    }
  };

  if (process.client) {
    // Немедленная предзагрузка критических ресурсов
    preloadCriticalResources();
    
    // Настройка умной предзагрузки после загрузки DOM
    nextTick(() => {
      setupHoverPreload();
    });

    // Предзагрузка при навигации
    const router = useRouter();
    router.beforeEach((to, from) => {
      if (to.path !== from.path) {
        // Предзагружаем данные для следующей страницы
        preloadAPIData(to.path);
        
        // Предзагружаем критические ресурсы для каталога
        if (to.path.startsWith('/catalog')) {
          smartPreload('/api/categories');
          smartPreload('/api/products/list');
        }
      }
    });

    // Предзагрузка при idle состоянии
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Предзагружаем популярные страницы
        ['/catalog', '/about', '/contacts'].forEach(smartPreload);
      });
    }
  }
});
