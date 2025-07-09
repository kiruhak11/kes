import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const visits = await prisma.visits.findMany({
      orderBy: { date: 'desc' },
      take: 30
    })
    const countries = await prisma.country_stats.findMany({
      orderBy: { count: 'desc' }
    })
    const browsers = await prisma.browser_stats.findMany({
      orderBy: { count: 'desc' }
    })
    return { visits, countries, browsers }
  } catch (e: any) {
    console.error('GET /api/statistics error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 