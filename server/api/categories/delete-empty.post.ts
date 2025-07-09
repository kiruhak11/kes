import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Находим все пустые категории (без продуктов)
    const categories = await prisma.categories.findMany()
    const products = await prisma.products.findMany()
    const emptyCategoryIds = categories
      .filter(cat => !products.some(prod => prod.category_id === cat.id))
      .map(cat => cat.id)
    await prisma.categories.deleteMany({ where: { id: { in: emptyCategoryIds } } })
    return { success: true, deleted: emptyCategoryIds.length }
  } catch (e: any) {
    console.error('POST /api/categories/delete-empty error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 