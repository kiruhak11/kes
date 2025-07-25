interface OptimizedFetchOptions {
  cache?: boolean;
  priority?: 'high' | 'normal' | 'low';
  timeout?: number;
  retry?: number;
}

// Кэш для запросов
const requestCache = new Map<string, any>();
const pendingRequests = new Map<string, Promise<any>>();

export const useOptimizedFetch = <T>(
  url: string | (() => string),
  options: OptimizedFetchOptions = {}
) => {
  const {
    cache = true,
    priority = 'normal',
    timeout = 10000,
    retry = 2,
  } = options;

  const getUrl = () => typeof url === 'function' ? url() : url;
  const cacheKey = computed(() => getUrl());

  // Проверяем кэш
  if (cache && requestCache.has(cacheKey.value)) {
    return {
      data: ref(requestCache.get(cacheKey.value)),
      pending: ref(false),
      error: ref(null),
      refresh: () => {},
    };
  }

  // Проверяем pending запросы
  if (pendingRequests.has(cacheKey.value)) {
    const data = ref(null);
    const pending = ref(true);
    const error = ref(null);

    pendingRequests.get(cacheKey.value)!.then(
      (result) => {
        data.value = result;
        pending.value = false;
        if (cache) requestCache.set(cacheKey.value, result);
      },
      (err) => {
        error.value = err;
        pending.value = false;
      }
    );

    return { data, pending, error, refresh: () => {} };
  }

  const data = ref<T | null>(null);
  const pending = ref(true);
  const error = ref<Error | null>(null);

  const fetchWithRetry = async (attempt = 0): Promise<T> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(getUrl(), {
        signal: controller.signal,
        headers: {
          'X-Priority': priority,
          'X-Cache-Control': cache ? 'max-age=300' : 'no-cache',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      if (attempt < retry && err instanceof Error && err.name !== 'AbortError') {
        // Экспоненциальная задержка для повторных попыток
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        return fetchWithRetry(attempt + 1);
      }
      throw err;
    }
  };

  const executeRequest = async () => {
    try {
      pending.value = true;
      error.value = null;

      const promise = fetchWithRetry();
      pendingRequests.set(cacheKey.value, promise);

      const result = await promise;
      
      data.value = result;
      if (cache) {
        requestCache.set(cacheKey.value, result);
      }
    } catch (err) {
      error.value = err as Error;
      console.error(`Optimized fetch error for ${cacheKey.value}:`, err);
    } finally {
      pending.value = false;
      pendingRequests.delete(cacheKey.value);
    }
  };

  const refresh = () => {
    if (cache) {
      requestCache.delete(cacheKey.value);
    }
    executeRequest();
  };

  // Выполняем запрос
  executeRequest();

  return {
    data: readonly(data),
    pending: readonly(pending),
    error: readonly(error),
    refresh,
  };
};

// Утилита для предзагрузки данных
export const preloadData = (url: string, options: OptimizedFetchOptions = {}) => {
  if (process.client && !requestCache.has(url) && !pendingRequests.has(url)) {
    useOptimizedFetch(url, { ...options, cache: true });
  }
};

// Очистка кэша
export const clearCache = (pattern?: string) => {
  if (pattern) {
    const regex = new RegExp(pattern);
    for (const key of requestCache.keys()) {
      if (regex.test(key)) {
        requestCache.delete(key);
      }
    }
  } else {
    requestCache.clear();
  }
};