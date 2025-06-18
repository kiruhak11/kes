import { serverSupabaseClient } from '#supabase/server'
import { createError } from 'h3'

interface ProductSpecs {
  power?: string
  fuel?: string | string[]
  images?: string[]
  [key: string]: any
}

interface Product {
  name: string
  description: string
  extendedDescription?: string
  price: number
  image: string
  category_id: string
  additional_images?: string[]
  specs?: ProductSpecs
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) 

    // Validate request body
    if (!body || typeof body !== 'object') {
      console.error('Invalid request body:', body)
      throw createError({
        statusCode: 400,
        message: 'Invalid request body'
      })
    }

    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category_id']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
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
      additional_images: Array.isArray(body.additional_images) ? body.additional_images : [],
      specs: body.specs || {}
    }
 

    // Insert into database
    const { data, error } = await client
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === '42501') {
        throw createError({
          statusCode: 403,
          message: 'Permission denied. Please check RLS policies.'
        })
      }
      throw createError({
        statusCode: 500,
        message: error.message
      })
    }
 
    return data
  } catch (error: any) {
    console.error('Error in POST /api/products:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})
