import { ref, onMounted, onUnmounted } from 'vue'

export const useAnimationOptimization = () => {
  const prefersReducedMotion = ref(false)
  const isLowPowerMode = ref(false)
  const frameRate = ref(60)

  // Определение предпочтений пользователя
  const checkUserPreferences = () => {
    if (process.client) {
      // Проверка предпочтений по движению
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.value = mediaQuery.matches
      
      // Проверка режима экономии энергии
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          isLowPowerMode.value = battery.level < 0.2
        })
      }
    }
  }

  // Оптимизация frame rate
  const optimizeFrameRate = () => {
    if (process.client) {
      let lastTime = performance.now()
      let frameCount = 0
      
      const measureFrameRate = () => {
        const currentTime = performance.now()
        frameCount++
        
        if (currentTime - lastTime >= 1000) {
          frameRate.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
          frameCount = 0
          lastTime = currentTime
        }
        
        requestAnimationFrame(measureFrameRate)
      }
      
      requestAnimationFrame(measureFrameRate)
    }
  }

  // Рекомендации по анимациям
  const animationRecommendations = computed(() => {
    const recommendations: string[] = []
    
    if (prefersReducedMotion.value) {
      recommendations.push('Отключить анимации')
      recommendations.push('Использовать простые переходы')
    }
    
    if (isLowPowerMode.value) {
      recommendations.push('Уменьшить частоту анимаций')
      recommendations.push('Использовать CSS анимации вместо JS')
    }
    
    if (frameRate.value < 30) {
      recommendations.push('Оптимизировать производительность')
      recommendations.push('Использовать transform вместо top/left')
    }
    
    return recommendations
  })

  // Оптимизированные CSS классы
  const getOptimizedAnimationClasses = () => {
    const classes: string[] = []
    
    if (prefersReducedMotion.value) {
      classes.push('no-animation')
    } else if (isLowPowerMode.value) {
      classes.push('reduced-animation')
    }
    
    return classes
  }

  // Throttle для анимаций
  const createThrottledAnimation = (callback: () => void, fps: number = 60) => {
    let lastTime = 0
    const interval = 1000 / fps
    
    return (currentTime: number) => {
      if (currentTime - lastTime >= interval) {
        callback()
        lastTime = currentTime
      }
    }
  }

  onMounted(() => {
    checkUserPreferences()
    optimizeFrameRate()
  })

  return {
    prefersReducedMotion: readonly(prefersReducedMotion),
    isLowPowerMode: readonly(isLowPowerMode),
    frameRate: readonly(frameRate),
    animationRecommendations,
    getOptimizedAnimationClasses,
    createThrottledAnimation,
  }
} 