import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const requests = await prisma.requests.findMany({
      orderBy: { created_at: 'desc' }
    })
    return { requests }
  } catch (e: any) {
    console.error('GET /api/requests error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 
