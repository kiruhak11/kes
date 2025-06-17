import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const id = event.context.params?.id

    if (!id) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Category ID is required' 
      })
    }

    // Проверяем, есть ли товары в этой категории
    const { data: products, error: productsError } = await client
      .from('products')
      .select('id')
      .eq('category_id', id)

    if (productsError) {
      console.error('Error checking products:', productsError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to check products in category' 
      })
    }

    // Если в категории есть товары, не даем её удалить
    if (products && products.length > 0) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Cannot delete category with existing products' 
      })
    }

    // Получаем категорию перед удалением
    const { data: categoryToDelete, error: fetchError } = await client
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching category:', fetchError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to fetch category' 
      })
    }

    if (!categoryToDelete) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Category not found' 
      })
    }

    // Удаляем категорию
    const { error: deleteError } = await client
      .from('categories')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting category:', deleteError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to delete category' 
      })
    }

    // Возвращаем удаленную категорию
    return categoryToDelete
  } catch (e: any) {
    console.error(`DELETE /api/categories/${event.context.params?.id} error:`, e)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: e.statusMessage || 'Internal Server Error' 
    })
  }
}) 