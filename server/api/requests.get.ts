import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)
    const { data, error } = await client
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching requests:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch requests'
      })
    }
    
    return { requests: data }
  } catch (e: any) {
    console.error('GET /api/requests error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 