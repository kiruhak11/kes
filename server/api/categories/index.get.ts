import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)

    const { data: products, error } = await client
      .from('products')
      .select('category')

    if (error) {
      console.error('Supabase query error (categories):', error.message)
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch categories from Supabase' })
    }

    // Извлекаем уникальные категории из продуктов
    const uniqueCategories = [...new Set(products.map(p => p.category).filter((category): category is string => typeof category === 'string'))];

    return uniqueCategories;
  } catch (e: any) {
    console.error('GET /api/categories error:', e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
}) 