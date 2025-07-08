import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '~/server/utils/prisma'

interface Characteristic {
  id: number
  key: string
  value: string
  show_in_filters?: boolean
}

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
  specs?: Characteristic[]
  delivery_set?: string
  connection_scheme?: string
  additional_requirements?: string
  required_products?: number[]
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
    // Prepare product data
    const productData = {
      name: body.name,
      description: body.description,
      extendedDescription: body.extendedDescription || '',
      price: Number(body.price) || 0,
      image: body.image || '/images/placeholders/placeholder.png',
      category_id: body.category_id,
      additional_images: Array.isArray(body.additional_images) ? body.additional_images : [],
      specs: Array.isArray(body.specs) ? body.specs : [],
      delivery_set: body.delivery_set || null,
      connection_scheme: body.connection_scheme || null,
      additional_requirements: body.additional_requirements || null,
      required_products: Array.isArray(body.required_products) ? body.required_products : null
    }
    const product = await prisma.products.create({ data: productData })
    return { product }
  } catch (e: any) {
    console.error('POST /api/products error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
})
