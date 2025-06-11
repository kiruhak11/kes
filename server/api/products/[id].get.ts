import { defineEventHandler, createError } from 'h3'
import { promises as fs, existsSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    const file = resolve(process.cwd(), 'data/products.json')
    if (!existsSync(file)) {
      throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }
    const content = await fs.readFile(file, 'utf-8')
    const products = JSON.parse(content) as any[]
    const prod = products.find(p => p.id === id)
    if (!prod) throw createError({ statusCode: 404, statusMessage: 'Not found' })
    return prod
  } catch (e: any) {
    console.error(`GET /api/products/${event.context.params?.id} error:`, e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
})
