import { serverSupabaseClient } from '#supabase/server'
import { createError, eventHandler, readBody } from 'h3'

export default eventHandler(async (event) => {
  try {
    const body = await readBody(event) 

    // Validate request body
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        message: 'Invalid request body'
      })
    }

    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category_id']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      throw createError({
        statusCode: 422,
        message: `Missing required fields: ${missingFields.join(', ')}`
      })
    }

    const client = await serverSupabaseClient(event)

    // Prepare product data
    const productData = {
      name: body.name,
      description: body.description,
      extendedDescription: body.extendedDescription || '',
      price: Number(body.price) || 0,
      image: body.image || '/images/placeholders/placeholder.png',
      category_id: body.category_id,
      specs: body.specs || {}
    }

    // Insert into database
    const { data: newProduct, error: insertError } = await client
      .from('products')
      .insert([productData])
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      if (insertError.code === '42501') {
        throw createError({
          statusCode: 403,
          message: 'Permission denied. Please check RLS policies.'
        })
      }
      throw createError({
        statusCode: 500,
        message: insertError.message
      })
    }

    if (!newProduct) {
      throw createError({
        statusCode: 500,
        message: 'Product was not created'
      })
    }

    return newProduct

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 