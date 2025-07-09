import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { productId, specs } = body
    if (!productId || !Array.isArray(specs)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid input' })
    }
    // Обновляем характеристики товара через Prisma
    const updated = await prisma.products.update({
      where: { id: Number(productId) },
      data: { specs }
    })
    return { success: true, product: updated }
  } catch (e: any) {
    console.error('POST /api/admin/update-specs error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 