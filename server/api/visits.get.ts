import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const visits = await prisma.visits.findMany({
      orderBy: { date: 'asc' }
    })
    return { visits }
  } catch (e: any) {
    console.error('GET /api/visits error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 