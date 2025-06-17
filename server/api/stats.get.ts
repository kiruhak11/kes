import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)
    
    // Получаем статистику посещений
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Посещения за сегодня
    const { data: todayVisits, error: todayError } = await client
      .from('visits')
      .select('count')
      .eq('date', today)
      .single()

    if (todayError) {
      console.error('Error fetching today visits:', todayError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch today visits'
      })
    }

    // Посещения за неделю
    const { data: weekVisits, error: weekError } = await client
      .from('visits')
      .select('count')
      .gte('date', weekAgo)
      .lte('date', today)

    if (weekError) {
      console.error('Error fetching week visits:', weekError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch week visits'
      })
    }

    // Посещения за месяц
    const { data: monthVisits, error: monthError } = await client
      .from('visits')
      .select('count')
      .gte('date', monthAgo)
      .lte('date', today)

    if (monthError) {
      console.error('Error fetching month visits:', monthError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch month visits'
      })
    }

    // Всего посещений
    const { data: totalVisits, error: totalError } = await client
      .from('visits')
      .select('count')

    if (totalError) {
      console.error('Error fetching total visits:', totalError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch total visits'
      })
    }

    // Статистика по заявкам
    const { data: requests, error: requestsError } = await client
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching requests:', requestsError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch requests'
      })
    }

    // Подсчет статистики
    const todayCount = todayVisits?.count || 0
    const weekCount = weekVisits?.reduce((sum, visit) => sum + (visit.count || 0), 0) || 0
    const monthCount = monthVisits?.reduce((sum, visit) => sum + (visit.count || 0), 0) || 0
    const totalCount = totalVisits?.reduce((sum, visit) => sum + (visit.count || 0), 0) || 0

    return {
      visits: {
        today: todayCount,
        week: weekCount,
        month: monthCount,
        total: totalCount
      },
      requests: requests || []
    }
  } catch (e: any) {
    console.error('GET /api/stats error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 