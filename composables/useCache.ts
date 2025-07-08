import { ref, computed } from 'vue'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

export const useCache = <T>(ttl: number = 5 * 60 * 1000) => {
  const cache = ref<Map<string, CacheItem<T>>>(new Map())

  const get = (key: string): T | null => {
    const item = cache.value.get(key)
    if (!item) return null

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      cache.value.delete(key)
      return null
    }

    return item.data as T
  }

  const set = (key: string, data: T, customTtl?: number): void => {
    cache.value.set(key, {
      data: data as any,
      timestamp: Date.now(),
      ttl: customTtl || ttl,
    })
  }

  const clear = (): void => {
    cache.value.clear()
  }

  const remove = (key: string): void => {
    cache.value.delete(key)
  }

  const has = (key: string): boolean => {
    return cache.value.has(key) && get(key) !== null
  }

  const size = computed(() => cache.value.size)

  return {
    get,
    set,
    clear,
    remove,
    has,
    size,
  }
}

// Composable для кэширования API запросов
export const useApiCache = <T>(ttl: number = 5 * 60 * 1000) => {
  const { get, set, has } = useCache<T>(ttl)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchWithCache = async (
    key: string,
    fetcher: () => Promise<T>,
    customTtl?: number
  ): Promise<T | null> => {
    // Проверяем кэш
    const cached = get(key)
    if (cached) {
      return cached
    }

    // Если нет в кэше, делаем запрос
    isLoading.value = true
    error.value = null

    try {
      const data = await fetcher()
      set(key, data, customTtl)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    fetchWithCache,
    isLoading: readonly(isLoading),
    error: readonly(error),
  }
} 