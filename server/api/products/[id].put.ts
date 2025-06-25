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
      category_id: body.category_id,
      specs: body.specs || null, // Если specs undefined, записываем null
      additional_images: Array.isArray(body.additional_images) ? body.additional_images : null,
      delivery_set: body.delivery_set || null,
      connection_scheme: body.connection_scheme || null,
      additional_requirements: body.additional_requirements || null,
      required_products: Array.isArray(body.required_products) ? body.required_products : null
    }
 

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
