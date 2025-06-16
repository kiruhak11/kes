import { ref } from 'vue'

export const useStats = () => {
  const visits = ref<{ date: string; count: number }[]>([])
  const requests = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchVisits = async () => {
    loading.value = true
    error.value = null
    try {
      const { data } = await useFetch('/api/visits')
      if (data.value) {
        visits.value = data.value
      }
    } catch (e) {
      error.value = 'Failed to fetch visits'
      console.error('Error fetching visits:', e)
    } finally {
      loading.value = false
    }
  }

  const fetchRequests = async () => {
    loading.value = true
    error.value = null
    try {
      const { data } = await useFetch('/api/requests')
      if (data.value) {
        requests.value = data.value
      }
    } catch (e) {
      error.value = 'Failed to fetch requests'
      console.error('Error fetching requests:', e)
    } finally {
      loading.value = false
    }
  }

  const trackVisit = async () => {
    try {
      await $fetch('/api/visits', {
        method: 'POST'
      })
    } catch (e) {
      console.error('Error tracking visit:', e)
    }
  }

  return {
    visits,
    requests,
    loading,
    error,
    fetchVisits,
    fetchRequests,
    trackVisit
  }
} 