import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const categories = await prisma.categories.findMany({ orderBy: { name: 'asc' } })
    const categoriesWithImages = await Promise.all(categories.map(async (cat) => {
      const products = await prisma.products.findMany({
        where: { category_id: cat.id },
        select: { image: true }
      })
      return {
        ...cat,
        images: products.map(p => p.image).filter(Boolean)
      }
    }))
    return { categories: categoriesWithImages }
  } catch (e: any) {
    console.error('GET /api/categories error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 