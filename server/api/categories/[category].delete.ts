import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)
    const categoryId = event.context.params?.category

    if (!categoryId) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Category ID is required' 
      })
    }

    // Check if category exists
    const { data: category, error: fetchError } = await client
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (fetchError) {
      console.error('Error fetching category:', fetchError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to fetch category' 
      })
    }

    if (!category) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Category not found' 
      })
    }

    // Check if category has products
    const { data: products, error: productsError } = await client
      .from('products')
      .select('id')
      .eq('category_id', categoryId)

    if (productsError) {
      console.error('Error checking for products:', productsError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to check for products in category' 
      })
    }

    if (products && products.length > 0) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Cannot delete category that contains products' 
      })
    }

    // Delete the category
    const { error: deleteError } = await client
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (deleteError) {
      console.error('Error deleting category:', deleteError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to delete category' 
      })
    }

    return { success: true, message: 'Category deleted successfully' }
  } catch (e: any) {
    console.error('DELETE /api/categories/[category] error:', e)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: e.statusMessage || 'Internal Server Error' 
    })
  }
}) 