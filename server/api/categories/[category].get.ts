import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const categorySlug = event.context.params?.category
    if (!categorySlug) {
      throw createError({ statusCode: 400, statusMessage: 'Category slug is required' })
    }
    const category = await prisma.categories.findFirst({ where: { slug: String(categorySlug) } })
    if (!category) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }
    return { category }
  } catch (e: any) {
    console.error('GET /api/categories/[category] error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 