interface MemoryOptions {
  maxCacheSize?: number;
  cleanupInterval?: number;
  enableGC?: boolean;
}

export const useMemoryOptimization = (options: MemoryOptions = {}) => {
  const {
    maxCacheSize = 50 * 1024 * 1024, // 50MB
    cleanupInterval: cleanupIntervalMs = 300000, // 5 минут
    enableGC = true,
  } = options;

  const memoryUsage = ref(0);
  const cacheSize = ref(0);
  const isLowMemory = ref(false);

  // Мониторинг памяти
  const checkMemoryUsage = () => {
    if (process.client && 'memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage.value = memory.usedJSHeapSize;
      
      // Определяем низкий уровень памяти
      const memoryRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      isLowMemory.value = memoryRatio > 0.8;
      
      if (isLowMemory.value) {
        console.warn('Low memory detected, triggering cleanup');
        triggerCleanup();
      }
    }
  };

  // Очистка неиспользуемых ресурсов
  const triggerCleanup = () => {
    // Очищаем кэш изображений
    if ('caches' in window) {
      caches.open('images-v1').then((cache) => {
        cache.keys().then((requests) => {
          // Удаляем старые изображения
          requests.slice(0, Math.floor(requests.length / 2)).forEach((request) => {
            cache.delete(request);
          });
        });
      });
    }

    // Очищаем DOM от скрытых элементов
    const hiddenElements = document.querySelectorAll('[style*="display: none"]');
    hiddenElements.forEach((el) => {
      if (el.parentNode && !el.hasAttribute('data-keep')) {
        el.remove();
      }
    });

    // Принудительная сборка мусора (если доступна)
    if (enableGC && 'gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  };

  // Оптимизация изображений в памяти
  const optimizeImageMemory = () => {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      // Освобождаем память от изображений вне viewport
      const rect = img.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight + 1000 && rect.bottom > -1000;
      
      if (!isVisible && img.src && !img.dataset.originalSrc) {
        img.dataset.originalSrc = img.src;
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';
      } else if (isVisible && img.dataset.originalSrc) {
        img.src = img.dataset.originalSrc;
        delete img.dataset.originalSrc;
      }
    });
  };

  // Управление кэшем компонентов
  const componentCache = new Map();
  const maxComponentCacheSize = 20;

  const cacheComponent = (key: string, component: any) => {
    if (componentCache.size >= maxComponentCacheSize) {
      const firstKey = componentCache.keys().next().value;
      componentCache.delete(firstKey);
    }
    componentCache.set(key, component);
  };

  const getCachedComponent = (key: string) => {
    return componentCache.get(key);
  };

  // Оптимизация событий
  const eventListeners = new WeakMap();
  
  const addOptimizedListener = (
    element: HTMLElement,
    event: string,
    handler: EventListener,
    options: AddEventListenerOptions = {}
  ) => {
    const optimizedHandler = throttle(handler, 16); // 60fps
    element.addEventListener(event, optimizedHandler, { passive: true, ...options });
    
    // Сохраняем ссылку для очистки
    if (!eventListeners.has(element)) {
      eventListeners.set(element, new Map());
    }
    eventListeners.get(element).set(event, optimizedHandler);
  };

  const removeOptimizedListener = (element: HTMLElement, event: string) => {
    const elementListeners = eventListeners.get(element);
    if (elementListeners && elementListeners.has(event)) {
      const handler = elementListeners.get(event);
      element.removeEventListener(event, handler);
      elementListeners.delete(event);
    }
  };

  // Throttle функция
  const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Мониторинг производительности
  const performanceMetrics = ref({
    fps: 60,
    memoryPressure: false,
    slowFrames: 0,
  });

  const monitorPerformance = () => {
    let lastTime = performance.now();
    let frameCount = 0;
    let slowFrameCount = 0;

    const measureFrame = (currentTime: number) => {
      frameCount++;
      const delta = currentTime - lastTime;
      
      if (delta > 16.67) { // Медленнее 60fps
        slowFrameCount++;
      }
      
      if (frameCount % 60 === 0) { // Каждые 60 кадров
        const fps = Math.round(1000 / (delta / frameCount));
        performanceMetrics.value.fps = fps;
        performanceMetrics.value.slowFrames = slowFrameCount;
        performanceMetrics.value.memoryPressure = isLowMemory.value;
        
        frameCount = 0;
        slowFrameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  };

  // Инициализация
  onMounted(() => {
    if (process.client) {
      // Запускаем мониторинг памяти
      checkMemoryUsage();
      const memoryInterval = setInterval(checkMemoryUsage, 30000); // Каждые 30 сек
      
      // Запускаем очистку по расписанию
      const cleanupTimer = setInterval(triggerCleanup, cleanupIntervalMs);
      
      // Оптимизируем изображения при скролле
      const scrollHandler = throttle(optimizeImageMemory, 100);
      window.addEventListener('scroll', scrollHandler, { passive: true });
      
      // Запускаем мониторинг производительности
      monitorPerformance();
      
      // Очистка при размонтировании
      onUnmounted(() => {
        clearInterval(memoryInterval);
        clearInterval(cleanupTimer);
        window.removeEventListener('scroll', scrollHandler);
      });
    }
  });

  return {
    memoryUsage: readonly(memoryUsage),
    cacheSize: readonly(cacheSize),
    isLowMemory: readonly(isLowMemory),
    performanceMetrics: readonly(performanceMetrics),
    triggerCleanup,
    cacheComponent,
    getCachedComponent,
    addOptimizedListener,
    removeOptimizedListener,
    throttle,
  };
};
