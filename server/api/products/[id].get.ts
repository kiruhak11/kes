import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const id = Number(event.context.params?.id)

    const { data: product, error } = await client
      .from('products')
      .select('id, name, description, extendedDescription, price, image, category, category_slug, specs')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase query error:', error.message)
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch product from Supabase' })
    }

    if (!product) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    }

    return product
  } catch (e: any) {
    console.error(`GET /api/products/${event.context.params?.id} error:`, e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
})
