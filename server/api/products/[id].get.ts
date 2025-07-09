import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const productId = event.context.params?.id
    if (!productId) {
      throw createError({ statusCode: 400, statusMessage: 'Product ID is required' })
    }
    const product = await prisma.products.findUnique({ where: { id: Number(productId) } })
    if (!product) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    }
    return { product }
  } catch (e: any) {
    console.error('GET /api/products/[id] error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
})
