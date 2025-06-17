import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)
    const { data, error } = await client
      .from('visits')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) {
      console.error('Error fetching visits:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch visits'
      })
    }
    
    return { visits: data }
  } catch (e: any) {
    console.error('GET /api/visits error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 