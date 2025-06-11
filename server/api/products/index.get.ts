import { defineEventHandler, createError } from 'h3'
import { promises as fs } from 'fs'
import { resolve } from 'path'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const category = query.category as string | undefined

    const file = resolve(process.cwd(), 'data/products.json')
    const content = await fs.readFile(file, 'utf-8')
    let products = JSON.parse(content)

    // Если указана категория, фильтруем товары
    if (category) {
      products = products.filter((p: any) => p.category === category)
    }

    return products
  } catch (e: any) {
    console.error('GET /api/products error:', e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
})
