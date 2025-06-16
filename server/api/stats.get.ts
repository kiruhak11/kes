import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

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

    // Посещения за неделю
    const { data: weekVisits, error: weekError } = await supabase
      .from('visits')
      .select('count')
      .gte('date', weekAgo)
      .lte('date', today)

    // Посещения за месяц
    const { data: monthVisits, error: monthError } = await supabase
      .from('visits')
      .select('count')
      .gte('date', monthAgo)
      .lte('date', today)

    // Всего посещений
    const { data: totalVisits, error: totalError } = await supabase
      .from('visits')
      .select('count')

    // Статистика по заявкам
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (todayError || weekError || monthError || totalError || requestsError) {
      throw new Error('Failed to fetch statistics')
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
  } catch (error) {
    console.error('Error fetching statistics:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch statistics'
    })
  }
}) 