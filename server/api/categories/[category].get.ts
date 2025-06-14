import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const category = decodeURIComponent(event.context.params?.category || '')
    if (!category) {
      throw createError({ statusCode: 400, statusMessage: 'Category is required' })
    }

    const { data: categoryProducts, error } = await client.from('products')
      .select('*')
      .eq('category', category)

    if (error) {
      console.error('Supabase query error:', error.message)
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch products by category from Supabase' })
    }

    return categoryProducts
  } catch (e: any) {
    console.error(`GET /api/categories/${event.context.params?.category} error:`, e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
}) 