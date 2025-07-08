export default defineNuxtPlugin(() => {
  if (process.client) {
    // Мониторинг Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        } else if (entry.entryType === 'first-input') {
          const firstInput = entry as PerformanceEventTiming
          console.log('FID:', firstInput.processingStart - firstInput.startTime)
        } else if (entry.entryType === 'layout-shift') {
          const layoutShift = entry as any
          console.log('CLS:', layoutShift.value)
        }
      }
    })

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

    // Мониторинг времени загрузки страницы
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        console.log('Page Load Time:', navigation.loadEventEnd - navigation.loadEventStart)
        console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)
      }
    })

    // Мониторинг использования памяти
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
          console.warn('High memory usage:', memory.usedJSHeapSize / 1024 / 1024, 'MB')
        }
      }, 30000) // Проверка каждые 30 секунд
    }
  }
}) 