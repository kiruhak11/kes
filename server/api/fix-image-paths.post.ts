import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Получаем все товары
    const products = await prisma.products.findMany()
    let updatedCount = 0
    const updates = []
    for (const product of products) {
      // ...логика обработки путей изображений...
      // Пример: если image не начинается с '/', добавить '/images/'
      let updated = false
      let image = product.image
      if (image && !image.startsWith('/')) {
        image = '/images/' + image
        updated = true
      }
      if (updated) {
        await prisma.products.update({ where: { id: product.id }, data: { image } })
        updatedCount++
        updates.push(product.id)
      }
    }
    return { updatedCount, updates }
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 