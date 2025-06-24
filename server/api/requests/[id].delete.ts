import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)
    const id = Number(event.context.params?.id)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request ID is required'
      })
    }

    // Проверяем, существует ли заявка
    const { data: requestToDelete, error: fetchError } = await client
      .from('requests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch request'
      })
    }

    if (!requestToDelete) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Request not found'
      })
    }

    // Удаляем заявку
    const { error: deleteError } = await client
      .from('requests')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete request'
      })
    }

    return { success: true, message: 'Request deleted successfully', request: requestToDelete }
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 