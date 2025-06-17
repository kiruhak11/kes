import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    console.log('Tracking visit for date:', today)
    
    // Проверяем, есть ли уже запись за сегодня
    const { data: existingVisit, error: selectError } = await supabase
      .from('visits')
      .select('*')
      .eq('date', today)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing visit:', selectError)
      throw createError({
        statusCode: 500,
        message: 'Failed to check existing visit'
      })
    }

    if (existingVisit) {
      // Если запись есть, увеличиваем счетчик
      console.log('Updating existing visit count:', existingVisit.count + 1)
      const { data, error: updateError } = await supabase
        .from('visits')
        .update({ count: existingVisit.count + 1 })
        .eq('date', today)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating visit:', updateError)
        throw createError({
          statusCode: 500,
          message: 'Failed to update visit count'
        })
      }

      console.log('Visit updated successfully:', data)
      return data
    } else {
      // Если записи нет, создаем новую
      console.log('Creating new visit record')
      const { data, error: insertError } = await supabase
        .from('visits')
        .insert([{ date: today, count: 1 }])
        .select()
        .single()

      if (insertError) {
        console.error('Error creating visit:', insertError)
        throw createError({
          statusCode: 500,
          message: 'Failed to create visit record'
        })
      }

      console.log('Visit created successfully:', data)
      return data
    }
  } catch (error: any) {
    console.error('Error tracking visit:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to track visit'
    })
  }
}) 