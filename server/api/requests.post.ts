import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)
    const body = await readBody(event)
    // Ожидаем поля: phone, region, typeBuilding, fuelType, powerType, raw_text
    const { phone, region, typeBuilding, fuelType, powerType, raw_text } = body
    
    const { error } = await client
      .from('requests')
      .insert([{ phone, region, typeBuilding, fuelType, powerType, raw_text }])
    
    if (error) {
      console.error('Error creating request:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create request'
      })
    }
    
    return { success: true }
  } catch (e: any) {
    console.error('POST /api/requests error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 