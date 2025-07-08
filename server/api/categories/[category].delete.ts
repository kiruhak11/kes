import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const categoryId = event.context.params?.category
    if (!categoryId) {
      throw createError({ statusCode: 400, statusMessage: 'Category ID is required' })
    }
    await prisma.categories.delete({ where: { id: String(categoryId) } })
    return { success: true }
  } catch (e: any) {
    console.error('DELETE /api/categories/[category] error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 