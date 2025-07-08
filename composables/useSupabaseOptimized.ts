import { useApiCache } from './useCache'

export const useSupabaseOptimized = () => {
  const { fetchWithCache } = useApiCache()
  const client = useSupabaseClient()

  // Оптимизированное получение данных с кэшированием
  const fetchData = async <T>(
    table: string,
    query: any = {},
    cacheKey?: string,
    ttl: number = 5 * 60 * 1000 // 5 минут
  ): Promise<T[] | null> => {
    const key = cacheKey || `${table}_${JSON.stringify(query)}`
    
    const result = await fetchWithCache(
      key,
      async () => {
        let queryBuilder = client.from(table).select('*')
        
        // Применяем фильтры
        if (query.eq) {
          Object.entries(query.eq).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value)
          })
        }
        
        if (query.gt) {
          Object.entries(query.gt).forEach(([key, value]) => {
            queryBuilder = queryBuilder.gt(key, value)
          })
        }
        
        if (query.lt) {
          Object.entries(query.lt).forEach(([key, value]) => {
            queryBuilder = queryBuilder.lt(key, value)
          })
        }
        
        if (query.like) {
          Object.entries(query.like).forEach(([key, value]) => {
            queryBuilder = queryBuilder.like(key, value as string)
          })
        }
        
        if (query.orderBy) {
          queryBuilder = queryBuilder.order(query.orderBy.column, {
            ascending: query.orderBy.ascending !== false
          })
        }
        
        if (query.limit) {
          queryBuilder = queryBuilder.limit(query.limit)
        }
        
        const { data, error } = await queryBuilder
        
        if (error) {
          throw new Error(error.message)
        }
        
        return data as T[]
      },
      ttl
    )
    return result as T[] | null
  }

  // Оптимизированное получение одной записи
  const fetchOne = async <T>(
    table: string,
    id: string | number,
    cacheKey?: string
  ): Promise<T | null> => {
    const key = cacheKey || `${table}_${id}`
    
    const result = await fetchWithCache(
      key,
      async () => {
        const { data, error } = await client
          .from(table)
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) {
          throw new Error(error.message)
        }
        
        return data as T
      },
      10 * 60 * 1000 // 10 минут для отдельных записей
    )
    return result as T | null
  }

  // Оптимизированная вставка данных
  const insertData = async <T>(
    table: string,
    data: Partial<T>
  ): Promise<T | null> => {
    try {
      const { data: result, error } = await client
        .from(table)
        .insert(data)
        .select()
        .single()
      
      if (error) {
        throw new Error(error.message)
      }
      
      return result as T
    } catch (error) {
      console.error('Insert error:', error)
      return null
    }
  }

  // Оптимизированное обновление данных
  const updateData = async <T>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T | null> => {
    try {
      const { data: result, error } = await client
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw new Error(error.message)
      }
      
      return result as T
    } catch (error) {
      console.error('Update error:', error)
      return null
    }
  }

  // Оптимизированное удаление данных
  const deleteData = async (
    table: string,
    id: string | number
  ): Promise<boolean> => {
    try {
      const { error } = await client
        .from(table)
        .delete()
        .eq('id', id)
      
      if (error) {
        throw new Error(error.message)
      }
      
      return true
    } catch (error) {
      console.error('Delete error:', error)
      return false
    }
  }

  // Оптимизированная подписка на изменения
  const subscribeToChanges = <T>(
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) => {
    const subscription = client
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter,
        },
        callback
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  return {
    fetchData,
    fetchOne,
    insertData,
    updateData,
    deleteData,
    subscribeToChanges,
  }
} 