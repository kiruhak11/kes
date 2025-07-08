import { ref, onMounted, onUnmounted, computed, readonly } from 'vue'

export const useNetworkStatus = () => {
  const isOnline = ref(true)
  const connectionType = ref<string>('')
  const effectiveType = ref<string>('')
  const downlink = ref<number>(0)
  const rtt = ref<number>(0)

  const updateNetworkInfo = () => {
    if (process.client && 'navigator' in window) {
      isOnline.value = navigator.onLine
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connectionType.value = connection.effectiveType || 'unknown'
        effectiveType.value = connection.effectiveType || 'unknown'
        downlink.value = connection.downlink || 0
        rtt.value = connection.rtt || 0
      }
    }
  }

  const handleOnline = () => {
    isOnline.value = true
  }

  const handleOffline = () => {
    isOnline.value = false
  }

  const handleConnectionChange = () => {
    updateNetworkInfo()
  }

  onMounted(() => {
    if (process.client) {
      updateNetworkInfo()
      
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connection.addEventListener('change', handleConnectionChange)
      }
    }
  })

  onUnmounted(() => {
    if (process.client) {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  })

  // Определение качества соединения
  const connectionQuality = computed(() => {
    if (!isOnline.value) return 'offline'
    if (effectiveType.value === '4g') return 'excellent'
    if (effectiveType.value === '3g') return 'good'
    if (effectiveType.value === '2g') return 'poor'
    return 'unknown'
  })

  // Рекомендации для оптимизации
  const optimizationRecommendations = computed(() => {
    const recommendations: string[] = []
    
    if (connectionQuality.value === 'poor') {
      recommendations.push('Используйте сжатые изображения')
      recommendations.push('Отключите ненужные анимации')
      recommendations.push('Используйте кэширование')
    }
    
    if (downlink.value < 1) {
      recommendations.push('Используйте lazy loading')
      recommendations.push('Минимизируйте HTTP запросы')
    }
    
    return recommendations
  })

  return {
    isOnline: readonly(isOnline),
    connectionType: readonly(connectionType),
    effectiveType: readonly(effectiveType),
    downlink: readonly(downlink),
    rtt: readonly(rtt),
    connectionQuality,
    optimizationRecommendations,
  }
}