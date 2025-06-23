import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)

    // Получаем все категории
    const { data: categories, error: categoriesError } = await client
      .from('categories')
      .select('id, name')

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to fetch categories',
        data: { error: categoriesError.message }
      })
    }

    if (!categories || categories.length === 0) {
      return { deletedCount: 0, message: 'No categories found' }
    }

    // Получаем все товары с их категориями
    const { data: products, error: productsError } = await client
      .from('products')
      .select('id, category_id')

    if (productsError) {
      console.error('Error fetching products:', productsError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to fetch products',
        data: { error: productsError.message }
      })
    }

    // Создаем Set с ID категорий, которые содержат товары
    const categoriesWithProducts = new Set<string>()
    if (products) {
      products.forEach(product => {
        if (product.category_id) {
          categoriesWithProducts.add(String(product.category_id))
        }
      })
    }

    // Находим пустые категории (те, которые не содержат товаров)
    const emptyCategories = categories.filter(category => 
      !categoriesWithProducts.has(String(category.id))
    )

    if (emptyCategories.length === 0) {
      return { deletedCount: 0, message: 'No empty categories found' }
    }

    // Удаляем пустые категории
    const emptyCategoryIds = emptyCategories.map(cat => cat.id)
    const { error: deleteError } = await client
      .from('categories')
      .delete()
      .in('id', emptyCategoryIds)

    if (deleteError) {
      console.error('Error deleting empty categories:', deleteError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to delete empty categories',
        data: { error: deleteError.message }
      })
    }

    return {
      deletedCount: emptyCategories.length,
      deletedCategories: emptyCategories.map(cat => ({ id: cat.id, name: cat.name })),
      message: `Successfully deleted ${emptyCategories.length} empty categories`
    }

  } catch (e: any) {
    console.error('POST /api/categories/delete-empty error:', e)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: e.statusMessage || 'Internal Server Error',
      data: e.data
    })
  }
}) 