import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody<{ title: string; description?: string; slug?: string }>(event)

    if (!body.title) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Bad Request: title is required' 
      })
    }

    // Убеждаемся, что у нас есть slug
    const slug = body.slug || body.title.toLowerCase()
      .replace(/[^a-z0-9а-яё]+/g, '-')  // Добавляем поддержку кириллицы
      .replace(/(^-|-$)/g, '')
 
    // Создаем новую категорию в базе данных
    const { data: category, error } = await client
      .from('categories')
      .insert([
        { 
          name: body.title,
          description: body.description || '',
          slug: slug
        }
      ])
      .select('*')  // Явно запрашиваем все поля
      .single()

    if (error) {
      console.error('Error creating category:', error)
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Failed to create category: ${error.message}` 
      })
    }

    if (!category) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to create category: no data returned' 
      })
    }
 
    return category

  } catch (e: any) {
    console.error('POST /api/categories error:', e)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: e.message || 'Internal Server Error' 
    })
  }
}) 