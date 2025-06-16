import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const id = Number(event.context.params?.id)
    const body = await readBody(event)

    // Map the incoming data to match the database schema
    const updateData = {
      name: body.name,
      description: body.description,
      extendedDescription: body.extendedDescription,
      price: body.price,
      image: body.image,
      category: body.category,
      category_slug: body.category_slug,
      specs: body.specs || {}
    }

    console.log('Updating product with data:', updateData)

    const { data, error } = await client.from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error.message)
      throw createError({ statusCode: 500, statusMessage: 'Failed to update product in Supabase' })
    }

    if (!data) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    }

    return data
  } catch (e: any) {
    console.error(`PUT /api/products/${event.context.params?.id} error:`, e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
})
