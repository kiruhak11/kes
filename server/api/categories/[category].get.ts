import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)
    const categorySlug = decodeURIComponent(event.context.params?.category || '')
    if (!categorySlug) {
      throw createError({ statusCode: 400, statusMessage: 'Category slug is required' })
    }

    // Получаем категорию по slug
    const { data: categories, error: catError } = await client
      .from('categories')
      .select('*')
      .eq('slug', categorySlug)
      .limit(10)

    if (catError) {
      console.error('Category fetch error:', catError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to fetch category',
        data: { error: catError.message }
      })
    }

    if (!categories || categories.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }

    const category = categories[0]

    // Получаем товары по category_id
    const { data: products, error: prodError } = await client
      .from('products')
      .select('*')
      .eq('category_id', category.id)
      .order('id', { ascending: true })

    if (prodError) {
      console.error('Products fetch error:', prodError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to fetch products by category',
        data: { error: prodError.message }
      })
    }

    return {
      category,
      products: products || []
    }
  } catch (e: any) {
    console.error(`GET /api/categories/${event.context.params?.category} error:`, e)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: e.statusMessage || 'Internal Server Error',
      data: e.data
    })
  }
}) 