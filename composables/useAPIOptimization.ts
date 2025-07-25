interface APIOptimizationOptions {
  enableBatching?: boolean;
  batchDelay?: number;
  enableCompression?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  enableCache?: boolean;
  cacheTimeout?: number;
}

export const useAPIOptimization = (options: APIOptimizationOptions = {}) => {
  const {
    enableBatching = true,
    batchDelay = 50,
    enableCompression = true,
    enableRetry = true,
    maxRetries = 3,
    enableCache = true,
    cacheTimeout = 300000, // 5 минут
  } = options;

  // Кэш для API запросов
  const apiCache = new Map<string, { data: any; timestamp: number; etag?: string }>();
  const pendingRequests = new Map<string, Promise<any>>();
  const batchQueue = new Map<string, Array<{ resolve: Function; reject: Function; params: any }>>();

  // Оптимизированный fetch с кэшированием
  const optimizedFetch = async <T>(
    url: string,
    options: RequestInit & { skipCache?: boolean } = {}
  ): Promise<T> => {
    const cacheKey = `${url}:${JSON.stringify(options)}`;
    
    // Проверяем кэш
    if (enableCache && !options.skipCache) {
      const cached = apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTimeout) {
        return cached.data;
      }
    }

    // Проверяем pending запросы (дедупликация)
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!;
    }

    // Создаем оптимизированный запрос
    const requestPromise = executeOptimizedRequest<T>(url, options, cacheKey);
    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Кэшируем результат
      if (enableCache && !options.skipCache) {
        apiCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }
      
      return result;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  };

  // Выполнение оптимизированного запроса
  const executeOptimizedRequest = async <T>(
    url: string,
    options: RequestInit,
    cacheKey: string
  ): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут

    try {
      // Подготавливаем заголовки
      const headers = new Headers(options.headers);
      
      if (enableCompression) {
        headers.set('Accept-Encoding', 'gzip, deflate, br');
      }
      
      // Добавляем ETag для кэширования
      const cached = apiCache.get(cacheKey);
      if (cached?.etag) {
        headers.set('If-None-Match', cached.etag);
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Обрабатываем 304 Not Modified
      if (response.status === 304 && cached) {
        return cached.data;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Сохраняем ETag для будущих запросов
      const etag = response.headers.get('ETag');
      const data = await response.json();

      if (etag && enableCache) {
        apiCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          etag,
        });
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (enableRetry && error instanceof Error && error.name !== 'AbortError') {
        return retryRequest<T>(url, options, cacheKey, 0);
      }
      
      throw error;
    }
  };

  // Повторные попытки с экспоненциальной задержкой
  const retryRequest = async <T>(
    url: string,
    options: RequestInit,
    cacheKey: string,
    attempt: number
  ): Promise<T> => {
    if (attempt >= maxRetries) {
      throw new Error(`Max retries (${maxRetries}) exceeded for ${url}`);
    }

    const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      return await executeOptimizedRequest<T>(url, options, cacheKey);
    } catch (error) {
      return retryRequest<T>(url, options, cacheKey, attempt + 1);
    }
  };

  // Батчинг запросов
  const batchRequest = <T>(
    endpoint: string,
    params: any
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!batchQueue.has(endpoint)) {
        batchQueue.set(endpoint, []);
        
        // Выполняем батч через заданную задержку
        setTimeout(() => {
          executeBatch(endpoint);
        }, batchDelay);
      }

      batchQueue.get(endpoint)!.push({ resolve, reject, params });
    });
  };

  // Выполнение батча запросов
  const executeBatch = async (endpoint: string) => {
    const batch = batchQueue.get(endpoint);
    if (!batch || batch.length === 0) return;

    batchQueue.delete(endpoint);

    try {
      const batchParams = batch.map(item => item.params);
      const results = await optimizedFetch(`${endpoint}/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: batchParams }),
      });

      // Распределяем результаты
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      // Отклоняем все запросы в батче
      batch.forEach(item => item.reject(error));
    }
  };

  // GraphQL оптимизация
  const optimizedGraphQL = async <T>(
    query: string,
    variables?: any,
    operationName?: string
  ): Promise<T> => {
    const body = JSON.stringify({
      query: query.replace(/\s+/g, ' ').trim(), // Минифицируем запрос
      variables,
      operationName,
    });

    return optimizedFetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body,
    });
  };

  // Предзагрузка данных
  const preloadData = (urls: string[]) => {
    if (process.client) {
      urls.forEach(url => {
        // Используем requestIdleCallback для предзагрузки
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            optimizedFetch(url).catch(() => {
              // Игнорируем ошибки предзагрузки
            });
          });
        }
      });
    }
  };

  // Инвалидация кэша
  const invalidateCache = (pattern?: string | RegExp) => {
    if (pattern) {
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      for (const key of apiCache.keys()) {
        if (regex.test(key)) {
          apiCache.delete(key);
        }
      }
    } else {
      apiCache.clear();
    }
  };

  // Мониторинг API производительности
  const apiMetrics = ref({
    totalRequests: 0,
    cacheHits: 0,
    averageResponseTime: 0,
    errorRate: 0,
  });

  const trackAPICall = (url: string, duration: number, success: boolean) => {
    apiMetrics.value.totalRequests++;
    
    if (success) {
      const currentAvg = apiMetrics.value.averageResponseTime;
      const total = apiMetrics.value.totalRequests;
      apiMetrics.value.averageResponseTime = (currentAvg * (total - 1) + duration) / total;
    } else {
      apiMetrics.value.errorRate = 
        (apiMetrics.value.errorRate * (apiMetrics.value.totalRequests - 1) + 1) / 
        apiMetrics.value.totalRequests;
    }
  };

  // Очистка кэша по расписанию
  const scheduleCleanup = () => {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of apiCache.entries()) {
        if (now - value.timestamp > cacheTimeout) {
          apiCache.delete(key);
        }
      }
    }, cacheTimeout / 2); // Очищаем каждые 2.5 минуты
  };

  // Инициализация
  onMounted(() => {
    if (process.client) {
      scheduleCleanup();
    }
  });

  return {
    optimizedFetch,
    batchRequest,
    optimizedGraphQL,
    preloadData,
    invalidateCache,
    apiMetrics: readonly(apiMetrics),
    trackAPICall,
  };
};