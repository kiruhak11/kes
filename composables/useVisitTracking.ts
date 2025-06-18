import { ref } from 'vue'

export const useVisitTracking = () => {
  const isTracked = ref(false)
  const error = ref<string | null>(null)

  const trackVisit = async () => {
    // Проверяем, не отслеживали ли мы уже посещение в этой сессии
    if (isTracked.value) {
      return
    }

    try {
      const response = await $fetch('/api/visits', {
        method: 'POST'
      })
      isTracked.value = true
      error.value = null
    } catch (e) {
      console.error('Error tracking visit:', e)
      error.value = e instanceof Error ? e.message : 'Failed to track visit'
    }
  }

  return {
    trackVisit,
    isTracked,
    error
  }
} 