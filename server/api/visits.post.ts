import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const todayDate = new Date(today)
    // Проверяем, есть ли уже запись за сегодня
    let visit = await prisma.visits.findFirst({ where: { date: todayDate } })
    if (visit) {
      // Если запись есть, увеличиваем счетчик
      visit = await prisma.visits.update({
        where: { id: visit.id },
        data: { count: visit.count + 1 }
      })
      return {
        ...visit,
        id: Number(visit.id)
      }
    } else {
      // Если записи нет, создаем новую
      visit = await prisma.visits.create({
        data: { date: todayDate, count: 1 }
      })
      return {
        ...visit,
        id: Number(visit.id)
      }
    }
  } catch (e: any) {
    console.error('POST /api/visits error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 