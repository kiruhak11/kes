import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const body = await readBody(event)
    const { name, slug, description } = body
    if (!name || !slug) {
      throw createError({ statusCode: 400, statusMessage: 'Name and slug are required' })
    }
    const created = await prisma.categories.create({ data: { name, slug, description } })
    return { success: true, category: created }
  } catch (e: any) {
    console.error('POST /api/categories error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 
