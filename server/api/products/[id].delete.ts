import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const productId = event.context.params?.id
    if (!productId) {
      throw createError({ statusCode: 400, statusMessage: 'Product ID is required' })
    }
    await prisma.products.delete({ where: { id: Number(productId) } })
    return { success: true }
  } catch (e: any) {
    console.error('DELETE /api/products/[id] error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
})
