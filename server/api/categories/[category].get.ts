import { defineEventHandler, createError } from 'h3'
import { promises as fs, existsSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const category = decodeURIComponent(event.context.params?.category || '')
    if (!category) {
      throw createError({ statusCode: 400, statusMessage: 'Category is required' })
    }

    const file = resolve(process.cwd(), 'data/products.json')
    if (!existsSync(file)) {
      throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }

    const content = await fs.readFile(file, 'utf-8')
    const products = JSON.parse(content)
    const categoryProducts = products.filter((p: any) => p.category === category)

    return categoryProducts
  } catch (e: any) {
    console.error(`GET /api/categories/${event.context.params?.category} error:`, e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
}) 