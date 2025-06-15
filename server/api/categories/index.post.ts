import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody<{ title: string; slug: string }>(event)

    if (!body.title || !body.slug) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Bad Request: title and slug are required' 
      })
    }

    // Создаем новый продукт с категорией
    const { data, error } = await client.from('products')
      .insert([{
        name: body.title,
        description: `Товары категории ${body.title}`,
        price: 0,
        category: body.title,
        category_slug: body.slug,
        specs: {
          power: 'отсутствует',
          fuel: ['отсутствует']
        }
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error.message)
      throw createError({ statusCode: 500, statusMessage: 'Failed to create category in Supabase' })
    }

    return data
  } catch (e: any) {
    console.error('POST /api/categories error:', e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
}) 