import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

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
  specs?: ProductSpecs
}

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const body = await readBody(event)
    // Валидация
    if (!body || typeof body !== 'object') {
      throw createError({ statusCode: 400, message: 'Invalid request body' })
    }
    const requiredFields = ['name', 'description', 'price', 'category_id']
    const missingFields = requiredFields.filter(field => !body[field])
    if (missingFields.length > 0) {
      throw createError({ statusCode: 422, message: `Missing required fields: ${missingFields.join(', ')}` })
    }
    // Создание товара через Prisma
    const productData = {
      name: body.name,
      description: body.description,
      extendedDescription: body.extendedDescription || '',
      price: Number(body.price) || 0,
      image: body.image || '/images/placeholders/placeholder.png',
      category_id: body.category_id,
      specs: body.specs || {},
      additional_images: Array.isArray(body.additional_images) ? body.additional_images : [],
      delivery_set: body.delivery_set || null,
      connection_scheme: body.connection_scheme || null,
      additional_requirements: body.additional_requirements || null,
      required_products: Array.isArray(body.required_products) ? body.required_products : null
    }
    const newProduct = await prisma.products.create({ data: productData })
    return { product: newProduct }
  } catch (e: any) {
    throw createError({ statusCode: e.statusCode || 500, message: e.message || 'Internal Server Error' })
  }
}) 
