import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)

    // Получаем все категории
    const { data: categories, error: catError } = await client
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (catError) {
      console.error('Categories fetch error:', catError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to fetch categories',
        data: { error: catError.message }
      })
    }

    if (!categories) {
      return []
    }

    // Получаем товары для каждой категории
    const categoriesWithImages = await Promise.all(categories.map(async (category) => {
      const { data: products, error: prodError } = await client
        .from('products')
        .select('image')
        .eq('category_id', category.id)
        .order('id', { ascending: true })
        .limit(4)

      if (prodError) {
        console.error(`Products fetch error for category ${category.id}:`, prodError)
        return {
          ...category,
          images: ['/images/placeholders/category-placeholder.png']
        }
      }

      const images = products
        ?.filter(product => product.image)
        .map(product => product.image) || []

      return {
        id: category.id,
        title: category.name,
        slug: category.slug,
        description: category.description,
        images: images.length > 0 ? images : ['/images/placeholders/category-placeholder.png']
      }
    }))

    return categoriesWithImages

  } catch (e: any) {
    console.error('GET /api/categories error:', e)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: e.statusMessage || 'Internal Server Error',
      data: e.data
    })
  }
}) 