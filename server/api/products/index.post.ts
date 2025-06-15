import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

interface ProductSpecs {
  power?: string
  fuel?: string | string[]
  [key: string]: any
}

interface Product {
  title: string
  description: string
  extended_description?: string
  price: number
  image: string
  category: string
  category_slug: string
  slug: string
  specs?: ProductSpecs
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('Received body:', body)

    // Validate request body
    if (!body || typeof body !== 'object') {
      console.error('Invalid request body:', body)
      throw createError({
        statusCode: 400,
        message: 'Invalid request body'
      })
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'category', 'category_slug']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      throw createError({
        statusCode: 400,
        message: `Missing required fields: ${missingFields.join(', ')}`
      })
    }

    // Prepare product data
    const productData = {
      title: body.title,
      description: body.description,
      extended_description: body.extended_description || '',
      price: Number(body.price),
      image: body.image || '/placeholder.jpg',
      category: body.category,
      category_slug: body.category_slug,
      slug: body.slug,
      specs: {
        power: body.specs?.power || 'отсутствует',
        fuel: body.specs?.fuel || 'отсутствует',
        ...(body.specs || {})
      }
    }

    console.log('Prepared product data:', productData)

    // Insert into database
    const client = await serverSupabaseClient(event)
    const { data, error } = await client
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw createError({
        statusCode: 500,
        message: error.message
      })
    }

    console.log('Successfully created product:', data)
    return data
  } catch (error: any) {
    console.error('Error in POST /api/products:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})
