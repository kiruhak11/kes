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
      await fs.mkdir(resolve(process.cwd(), 'data'), { recursive: true })
      await fs.writeFile(categoriesFile, '[]', 'utf-8')
      return { name: '', products: [] }
    }

    const categoriesContent = await fs.readFile(categoriesFile, 'utf-8')
    let categories = []
    try {
      categories = JSON.parse(categoriesContent)
    } catch (e) {
      console.error('Error parsing categories file:', e)
      categories = []
    }

    const category = categories.find((c: any) => c.id === categoryId)
    if (!category) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }

    // Read products
    const productsFile = resolve(process.cwd(), 'data/products.json')
    if (!existsSync(productsFile)) {
      await fs.writeFile(productsFile, '[]', 'utf-8')
      return { name: category.name, products: [] }
    }

    const productsContent = await fs.readFile(productsFile, 'utf-8')
    let products = []
    try {
      products = JSON.parse(productsContent)
    } catch (e) {
      console.error('Error parsing products file:', e)
      products = []
    }

    // Filter products by category ID (handle both string and number IDs)
    const categoryProducts = products.filter((p: any) => {
      if (!p.category) return false
      // Convert both to strings for comparison
      return String(p.category) === String(categoryId)
    })

    console.log('Category:', category.name)
    console.log('Category ID:', categoryId)
    console.log('Found products:', categoryProducts)

    // Set proper content type and encoding
    event.node.res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return { name: category.name, products: categoryProducts }
  } catch (e: any) {
    console.error(`GET /api/categories/${event.context.params?.id} error:`, e)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: e.statusMessage || 'Internal Server Error',
      data: e.message
    })
  }
}) 