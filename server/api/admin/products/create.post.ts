import { createError, eventHandler, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default eventHandler(async (event) => {
  try {
    requireAdmin(event)
    const body = await readBody(event)
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        message: 'Invalid request body'
      })
    }
    const requiredFields = ['name', 'description', 'price', 'category_id']
    const missingFields = requiredFields.filter(field => !body[field])
    if (missingFields.length > 0) {
      throw createError({
        statusCode: 422,
        message: `Missing required fields: ${missingFields.join(', ')}`
      })
    }
    const productData = {
      name: body.name,
      description: body.description,
      extendedDescription: body.extendedDescription || '',
      price: Number(body.price) || 0,
      image: body.image || '/images/placeholders/placeholder.png',
      category_id: body.category_id,
      specs: body.specs || {}
    }
    const newProduct = await prisma.products.create({ data: productData })
    return { product: newProduct }
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || 'Internal Server Error'
    })
  }
}) 
