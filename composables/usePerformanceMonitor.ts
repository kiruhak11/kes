interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domContentLoaded: number;
  loadComplete: number;
  memoryUsage: number;
  connectionSpeed: string;
}

export const usePerformanceMonitor = () => {
  const metrics = ref<Partial<PerformanceMetrics>>({});
  const isMonitoring = ref(false);
  const performanceScore = ref(0);

  // Инициализация мониторинга
  const startMonitoring = () => {
    if (!process.client || isMonitoring.value) return;
    
    isMonitoring.value = true;
    
    // Мониторинг Web Vitals
    monitorWebVitals();
    
    // Мониторинг загрузки страницы
    monitorPageLoad();
    
    // Мониторинг памяти
    monitorMemoryUsage();
    
    // Мониторинг соединения
    monitorConnection();
    
    // Расчет общего скора производительности
    calculatePerformanceScore();
  };

  // Мониторинг Web Vitals
  const monitorWebVitals = () => {
    if (!('PerformanceObserver' in window)) return;

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.value.fcp = fcpEntry.startTime;
        console.log(`🎨 FCP: ${fcpEntry.startTime.toFixed(2)}ms`);
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.value.lcp = lastEntry.startTime;
      console.log(`🖼️ LCP: ${lastEntry.startTime.toFixed(2)}ms`);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime;
        metrics.value.fid = fid;
        console.log(`⚡ FID: ${fid.toFixed(2)}ms`);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      metrics.value.cls = clsValue;
      console.log(`📐 CLS: ${clsValue.toFixed(4)}`);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  };

  // Мониторинг загрузки страницы
  const monitorPageLoad = () => {
    if (!('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      metrics.value.ttfb = navigation.responseStart - navigation.requestStart;
      metrics.value.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
      metrics.value.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
      
      console.log(`🌐 TTFB: ${metrics.value.ttfb.toFixed(2)}ms`);
      console.log(`📄 DOM Ready: ${metrics.value.domContentLoaded.toFixed(2)}ms`);
      console.log(`✅ Load Complete: ${metrics.value.loadComplete.toFixed(2)}ms`);
    }
  };

  // Мониторинг использования памяти
  const monitorMemoryUsage = () => {
    if (!('memory' in performance)) return;

    const updateMemoryUsage = () => {
      const memory = (performance as any).memory;
      metrics.value.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      console.log(`🧠 Memory: ${metrics.value.memoryUsage.toFixed(2)}MB`);
    };

    updateMemoryUsage();
    setInterval(updateMemoryUsage, 30000); // Каждые 30 секунд
  };

  // Мониторинг соединения
  const monitorConnection = () => {
    const connection = (navigator as any).connection;
    if (connection) {
      metrics.value.connectionSpeed = connection.effectiveType;
      console.log(`📡 Connection: ${connection.effectiveType} (${connection.downlink}Mbps)`);
      
      // Слушаем изменения соединения
      connection.addEventListener('change', () => {
        metrics.value.connectionSpeed = connection.effectiveType;
        console.log(`📡 Connection changed: ${connection.effectiveType}`);
      });
    }
  };

  // Расчет общего скора производительности
  const calculatePerformanceScore = () => {
    const calculate = () => {
      let score = 100;
      
      // Штрафы за медленные метрики
      if (metrics.value.fcp && metrics.value.fcp > 1800) score -= 20;
      if (metrics.value.lcp && metrics.value.lcp > 2500) score -= 25;
      if (metrics.value.fid && metrics.value.fid > 100) score -= 20;
      if (metrics.value.cls && metrics.value.cls > 0.1) score -= 15;
      if (metrics.value.ttfb && metrics.value.ttfb > 600) score -= 10;
      if (metrics.value.loadComplete && metrics.value.loadComplete > 3000) score -= 10;
      
      performanceScore.value = Math.max(0, score);
      
      // Логируем результат с эмодзи
      const emoji = score >= 90 ? '🚀' : score >= 70 ? '⚡' : score >= 50 ? '🐌' : '🐢';
      console.log(`${emoji} Performance Score: ${score}/100`);
    };

    // Рассчитываем скор через 5 секунд после загрузки
    setTimeout(calculate, 5000);
  };

  // Отправка метрик на сервер (опционально)
  const sendMetricsToServer = async () => {
    if (!process.client) return;

    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: metrics.value,
          score: performanceScore.value,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      });
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  };

  // Получение рекомендаций по оптимизации
  const getOptimizationSuggestions = () => {
    const suggestions: string[] = [];
    
    if (metrics.value.fcp && metrics.value.fcp > 1800) {
      suggestions.push('Оптимизируйте критический CSS и уберите блокирующие ресурсы');
    }
    
    if (metrics.value.lcp && metrics.value.lcp > 2500) {
      suggestions.push('Оптимизируйте изображения и используйте CDN');
    }
    
    if (metrics.value.fid && metrics.value.fid > 100) {
      suggestions.push('Уменьшите время выполнения JavaScript');
    }
    
    if (metrics.value.cls && metrics.value.cls > 0.1) {
      suggestions.push('Зафиксируйте размеры изображений и избегайте динамического контента');
    }
    
    if (metrics.value.memoryUsage && metrics.value.memoryUsage > 50) {
      suggestions.push('Оптимизируйте использование памяти и очистите неиспользуемые ресурсы');
    }
    
    return suggestions;
  };

  // Экспорт метрик в JSON
  const exportMetrics = () => {
    const data = {
      metrics: metrics.value,
      score: performanceScore.value,
      suggestions: getOptimizationSuggestions(),
      timestamp: new Date().toISOString(),
      url: process.client ? window.location.href : '',
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Инициализация при монтировании
  onMounted(() => {
    if (process.client) {
      // Запускаем мониторинг после полной загрузки
      if (document.readyState === 'complete') {
        startMonitoring();
      } else {
        window.addEventListener('load', startMonitoring);
      }
      
      // Отправляем метрики через 10 секунд
      setTimeout(sendMetricsToServer, 10000);
    }
  });

  return {
    metrics: readonly(metrics),
    performanceScore: readonly(performanceScore),
    isMonitoring: readonly(isMonitoring),
    startMonitoring,
    getOptimizationSuggestions,
    exportMetrics,
    sendMetricsToServer,
  };
};