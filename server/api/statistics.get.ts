import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)
    
    // Получаем статистику посещений
    const { data: visits, error: visitsError } = await client
      .from('visits')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)

    if (visitsError) {
      console.error('Error fetching visits:', visitsError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch visits data'
      })
    }

    // Получаем статистику по странам
    const { data: countries, error: countriesError } = await client
      .from('country_stats')
      .select('*')
      .order('count', { ascending: false })

    if (countriesError) {
      console.error('Error fetching country stats:', countriesError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch country statistics'
      })
    }

    // Получаем статистику по браузерам
    const { data: browsers, error: browsersError } = await client
      .from('browser_stats')
      .select('*')
      .order('count', { ascending: false })

    if (browsersError) {
      console.error('Error fetching browser stats:', browsersError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch browser statistics'
      })
    }

    return {
      visits,
      countries,
      browsers
    }
  } catch (e: any) {
    console.error('GET /api/statistics error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 