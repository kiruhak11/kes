import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const categoryId = event.context.params?.category
    if (!categoryId) {
      throw createError({ statusCode: 400, statusMessage: 'Category ID is required' })
    }
    const body = await readBody(event)
    const { name, slug, description } = body
    if (!name || !slug) {
      throw createError({ statusCode: 400, statusMessage: 'Name and slug are required' })
    }
    const updated = await prisma.categories.update({
      where: { id: String(categoryId) },
      data: { name, slug, description }
    })
    return { success: true, category: updated }
  } catch (e: any) {
    console.error('PUT /api/categories/[category] error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 