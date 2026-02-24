import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const categoryId = event.context.params?.id
    if (!categoryId) {
      throw createError({ statusCode: 400, statusMessage: 'Category ID is required' })
    }
    await prisma.categories.delete({ where: { id: String(categoryId) } })
    return { success: true }
  } catch (e: any) {
    console.error('DELETE /api/categories/[id] error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 
