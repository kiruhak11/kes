import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Получаем статистику посещений
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Посещения за сегодня
    const todayVisit = await prisma.visits.findFirst({ where: { date: new Date(today) } })
    // Посещения за неделю
    const weekVisits = await prisma.visits.findMany({
      where: {
        date: {
          gte: new Date(weekAgo),
          lte: new Date(today)
        }
      }
    })
    // Посещения за месяц
    const monthVisits = await prisma.visits.findMany({
      where: {
        date: {
          gte: new Date(monthAgo),
          lte: new Date(today)
        }
      }
    })
    // Всего посещений
    const allVisits = await prisma.visits.findMany()

    return {
      visits: {
        today: todayVisit?.count || 0,
        week: weekVisits.reduce((sum, v) => sum + v.count, 0),
        month: monthVisits.reduce((sum, v) => sum + v.count, 0),
        total: allVisits.reduce((sum, v) => sum + v.count, 0)
      },
      requests: {
        list: [], // Заполните, если нужно возвращать заявки
        stats: {}
      }
    }
  } catch (e: any) {
    console.error('GET /api/stats error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 