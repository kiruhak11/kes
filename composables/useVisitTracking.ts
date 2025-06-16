import { ref } from 'vue'

export const useVisitTracking = () => {
  const isTracked = ref(false)
  const error = ref<string | null>(null)

  const trackVisit = async () => {
    // Проверяем, не отслеживали ли мы уже посещение в этой сессии
    if (isTracked.value) {
      console.log('Visit already tracked in this session')
      return
    }

    try {
      console.log('Attempting to track visit...')
      const response = await $fetch('/api/visits', {
        method: 'POST'
      })
      console.log('Visit tracked successfully:', response)
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