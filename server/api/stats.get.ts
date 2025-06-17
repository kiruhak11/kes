import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    // Получаем статистику посещений
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Посещения за сегодня
    const { data: todayVisits, error: todayError } = await supabase
      .from('visits')
      .select('count')
      .eq('date', today)
      .single()

    if (todayError && todayError.code !== 'PGRST116') {
      console.error('Error fetching today visits:', todayError)
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch today visits'
      })
    }

    // Посещения за неделю
    const { data: weekVisits, error: weekError } = await supabase
      .from('visits')
      .select('count')
      .gte('date', weekAgo)
      .lte('date', today)

    if (weekError) {
      console.error('Error fetching week visits:', weekError)
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch week visits'
      })
    }

    // Посещения за месяц
    const { data: monthVisits, error: monthError } = await supabase
      .from('visits')
      .select('count')
      .gte('date', monthAgo)
      .lte('date', today)

    if (monthError) {
      console.error('Error fetching month visits:', monthError)
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch month visits'
      })
    }

    // Всего посещений
    const { data: totalVisits, error: totalError } = await supabase
      .from('visits')
      .select('count')

    if (totalError) {
      console.error('Error fetching total visits:', totalError)
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch total visits'
      })
    }

    // Статистика по заявкам
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (requestsError) {
      console.error('Error fetching requests:', requestsError)
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch requests'
      })
    }

    // Считаем статистику по типам заявок
    const requestStats = requests.reduce((acc: any, req: any) => {
      acc[req.type] = (acc[req.type] || 0) + 1
      acc[req.status] = (acc[req.status] || 0) + 1
      return acc
    }, {})

    return {
      visits: {
        today: todayVisits?.count || 0,
        week: weekVisits?.reduce((sum: number, v: any) => sum + v.count, 0) || 0,
        month: monthVisits?.reduce((sum: number, v: any) => sum + v.count, 0) || 0,
        total: totalVisits?.reduce((sum: number, v: any) => sum + v.count, 0) || 0
      },
      requests: {
        list: requests,
        stats: requestStats
      }
    }
  } catch (error: any) {
    console.error('Error fetching statistics:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch statistics'
    })
  }
}) 