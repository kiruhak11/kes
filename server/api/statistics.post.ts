import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { country, browser } = body
    if (!country || !browser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Country and browser are required'
      })
    }
    // Обновляем статистику по странам
    await prisma.country_stats.upsert({
      where: { country },
      update: { count: { increment: 1 } },
      create: { country, count: 1 }
    })
    // Обновляем статистику по браузерам
    await prisma.browser_stats.upsert({
      where: { browser },
      update: { count: { increment: 1 } },
      create: { browser, count: 1 }
    })
    return { success: true }
  } catch (e: any) {
    console.error('POST /api/statistics error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 