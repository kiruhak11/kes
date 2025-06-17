import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)
    const body = await readBody(event)
    const { country, browser } = body

    if (!country || !browser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Country and browser are required'
      })
    }

    // Обновляем статистику по странам
    const { error: countryError } = await client
      .from('country_stats')
      .upsert(
        { country, count: 1 },
        { onConflict: 'country' }
      )
      .select()

    if (countryError) {
      console.error('Error updating country stats:', countryError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update country statistics'
      })
    }

    // Обновляем статистику по браузерам
    const { error: browserError } = await client
      .from('browser_stats')
      .upsert(
        { browser, count: 1 },
        { onConflict: 'browser' }
      )
      .select()

    if (browserError) {
      console.error('Error updating browser stats:', browserError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update browser statistics'
      })
    }

    return { success: true }
  } catch (e: any) {
    console.error('POST /api/statistics error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 