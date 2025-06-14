import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const id = Number(event.context.params?.id)

    // Сначала получаем продукт, чтобы вернуть его после удаления
    const { data: productToDelete, error: fetchError } = await client.from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Supabase fetch error before delete:', fetchError.message)
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch product for deletion from Supabase' })
    }

    if (!productToDelete) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    }

    const { error: deleteError } = await client.from('products')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Supabase delete error:', deleteError.message)
      throw createError({ statusCode: 500, statusMessage: 'Failed to delete product from Supabase' })
    }

    return productToDelete
  } catch (e: any) {
    console.error(`DELETE /api/products/${event.context.params?.id} error:`, e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
})
