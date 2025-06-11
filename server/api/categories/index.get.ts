import { defineEventHandler, createError } from 'h3'
import { promises as fs, existsSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const categoriesFile = resolve(process.cwd(), 'data/categories.json')
    const productsFile = resolve(process.cwd(), 'data/products.json')

    // Ensure categories file exists
    if (!existsSync(categoriesFile)) {
      await fs.mkdir(resolve(process.cwd(), 'data'), { recursive: true })
      await fs.writeFile(categoriesFile, '[]', 'utf-8')
    }

    // Read categories
    const categoriesContent = await fs.readFile(categoriesFile, 'utf-8')
    const categories = JSON.parse(categoriesContent)

    // Read products to get counts
    if (existsSync(productsFile)) {
      const productsContent = await fs.readFile(productsFile, 'utf-8')
      const products = JSON.parse(productsContent)

      // Add count to each category
      const result = categories.map((category: any) => ({
        ...category,
        count: products.filter((p: any) => p.category === category.name).length
      }))

      // Set proper content type and encoding
      event.node.res.setHeader('Content-Type', 'application/json; charset=utf-8')
      return result
    }

    const result = categories.map((category: any) => ({
      ...category,
      count: 0
    }))

    // Set proper content type and encoding
    event.node.res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return result
  } catch (e: any) {
    console.error('GET /api/categories error:', e)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
}) 