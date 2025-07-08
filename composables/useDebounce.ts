import { ref, onUnmounted } from 'vue'

export const useDebounce = (delay: number = 300) => {
  const timeout = ref<NodeJS.Timeout | null>(null)

  const debounce = <T extends (...args: any[]) => any>(fn: T): T => {
    return ((...args: any[]) => {
      if (timeout.value) {
        clearTimeout(timeout.value)
      }
      timeout.value = setTimeout(() => {
        fn(...args)
      }, delay)
    }) as T
  }

  onUnmounted(() => {
    if (timeout.value) {
      clearTimeout(timeout.value)
    }
  })

  return { debounce }
}

export const useThrottle = (delay: number = 16) => {
  const lastCall = ref(0)
  const timeout = ref<NodeJS.Timeout | null>(null)

  const throttle = <T extends (...args: any[]) => any>(fn: T): T => {
    return ((...args: any[]) => {
      const now = Date.now()
      
      if (now - lastCall.value >= delay) {
        fn(...args)
        lastCall.value = now
      } else {
        if (timeout.value) {
          clearTimeout(timeout.value)
        }
        timeout.value = setTimeout(() => {
          fn(...args)
          lastCall.value = Date.now()
        }, delay - (now - lastCall.value))
      }
    }) as T
  }

  onUnmounted(() => {
    if (timeout.value) {
      clearTimeout(timeout.value)
    }
  })

  return { throttle }
}

// Composable для оптимизации обработчиков событий
export const useOptimizedHandlers = () => {
  const { debounce } = useDebounce()
  const { throttle } = useThrottle()

  const createOptimizedHandler = (
    handler: (...args: any[]) => void,
    type: 'debounce' | 'throttle' = 'debounce',
    delay?: number
  ) => {
    if (type === 'debounce') {
      return debounce(handler)
    } else {
      return throttle(handler)
    }
  }

  return {
    createOptimizedHandler,
  }
} 