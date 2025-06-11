import { defineEventHandler, createError } from 'h3'
import { promises as fs, existsSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const categoryId = Number(event.context.params?.id)
    if (!categoryId || Number.isNaN(categoryId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid category ID' })
    }

    // Read categories to get category name
    const categoriesFile = resolve(process.cwd(), 'data/categories.json')
    if (!existsSync(categoriesFile)) {
      throw createError({ statusCode: 404, statusMessage: 'Categories not found' })
    }

    const categoriesContent = await fs.readFile(categoriesFile, 'utf-8')
    const categories = JSON.parse(categoriesContent)
    const category = categories.find((c: any) => c.id === categoryId)

    if (!category) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }

    // Read products
    const productsFile = resolve(process.cwd(), 'data/products.json')
    if (!existsSync(productsFile)) {
      return []
    }

    const productsContent = await fs.readFile(productsFile, 'utf-8')
    const products = JSON.parse(productsContent)
    return products.filter((p: any) => p.category === category.name)
  } catch (e: any) {
    console.error(`GET /api/categories/${event.context.params?.id} error:`, e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
}) 