import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)
    const today = new Date().toISOString().split('T')[0]
    
    // Проверяем, есть ли уже запись за сегодня
    const { data: existingVisit, error: selectError } = await client
      .from('visits')
      .select('*')
      .eq('date', today)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing visit:', selectError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check existing visit'
      })
    }

    if (existingVisit) {
      // Если запись есть, увеличиваем счетчик 
      const { data, error: updateError } = await client
        .from('visits')
        .update({ count: existingVisit.count + 1 })
        .eq('date', today)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating visit:', updateError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update visit count'
        })
      }
 
      return data
    } else {
      // Если записи нет, создаем новую 
      const { data, error: insertError } = await client
        .from('visits')
        .insert([{ date: today, count: 1 }])
        .select()
        .single()

      if (insertError) {
        console.error('Error creating visit:', insertError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create visit record'
        })
      }
 
      return data
    }
  } catch (e: any) {
    console.error('POST /api/visits error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 