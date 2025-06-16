import { serverSupabaseClient } from '#supabase/server'
import { createError } from 'h3'

interface ProductSpecs {
  power?: string
  fuel?: string | string[]
  [key: string]: any
}

interface Product {
  name: string
  description: string
  extendedDescription?: string
  price: number
  image: string
  category: string
  category_slug: string
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
        statusCode: 422,
        message: `Missing required fields: ${missingFields.join(', ')}`
      })
    }

    const client = await serverSupabaseClient(event)

    // Проверяем уникальность slug
    const { data: existingProduct } = await client
      .from('products')
      .select('id')
      .eq('slug', body.slug)
      .single()

    if (existingProduct) {
      throw createError({
        statusCode: 422,
        message: 'Product with this slug already exists'
      })
    }

    // Prepare product data
    const productData = {
      name: body.title,
      description: body.description,
      extendedDescription: body.extended_description || '',
      price: Number(body.price) || 0,
      image: body.image || '/placeholder.jpg',
      category: body.category,
      category_slug: body.category_slug,
      specs: {
        power: body.specs?.power || 'отсутствует',
        fuel: body.specs?.fuel || 'отсутствует',
        ...(body.specs || {})
      }
    }

    console.log('Prepared product data:', productData)

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
