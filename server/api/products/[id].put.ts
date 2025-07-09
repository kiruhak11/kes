import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '~/server/utils/prisma'

interface Characteristic {
  id: number
  key: string
  value: string
  show_in_filters?: boolean
}

export default defineEventHandler(async (event) => {
  try {
    const productId = event.context.params?.id
    if (!productId) {
      throw createError({ statusCode: 400, statusMessage: 'Product ID is required' })
    }
    const body = await readBody(event)
    const updated = await prisma.products.update({
      where: { id: Number(productId) },
      data: body
    })
    return { success: true, product: updated }
  } catch (e: any) {
    console.error('PUT /api/products/[id] error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
})
