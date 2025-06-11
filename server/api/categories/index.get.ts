import { defineEventHandler, createError } from 'h3'
import { promises as fs, existsSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async () => {
  try {
    const file = resolve(process.cwd(), 'data/products.json')
    if (!existsSync(file)) {
      await fs.mkdir(resolve(process.cwd(), 'data'), { recursive: true })
      await fs.writeFile(file, '[]', 'utf-8')
    }
    const content = await fs.readFile(file, 'utf-8')
    const products = JSON.parse(content)

    // Get all unique categories from products
    const uniqueCategories = [...new Set(products.map((p: any) => p.category))]

    // Create category objects with count and image
    const categories = uniqueCategories.map(category => {
      const categoryProducts = products.filter((p: any) => p.category === category)
      const firstProduct = categoryProducts[0]
      return {
        name: category,
        image: firstProduct?.image || '/placeholder.jpg',
        count: categoryProducts.length
      }
    })

    return categories
  } catch (e: any) {
    console.error('GET /api/categories error:', e)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
}) 