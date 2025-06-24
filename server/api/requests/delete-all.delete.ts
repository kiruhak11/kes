import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)
    // Получаем количество заявок до удаления
    const { data: requests, error: fetchError } = await client
      .from('requests')
      .select('id')
    if (fetchError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch requests'
      })
    }
    const count = requests?.length || 0
    // Удаляем все заявки
    const { error: deleteError } = await client
      .from('requests')
      .delete()
      .neq('id', 0)
    if (deleteError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete all requests'
      })
    }
    return { success: true, deleted: count }
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 