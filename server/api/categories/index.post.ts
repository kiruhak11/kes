import { defineEventHandler, createError, readBody } from 'h3'
import { promises as fs, existsSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, image } = body

    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'Category name is required' })
    }

    const categoriesFile = resolve(process.cwd(), 'data/categories.json')
    
    // Ensure categories file exists
    if (!existsSync(categoriesFile)) {
      await fs.mkdir(resolve(process.cwd(), 'data'), { recursive: true })
      await fs.writeFile(categoriesFile, '[]', 'utf-8')
    }

    // Read existing categories
    const content = await fs.readFile(categoriesFile, 'utf-8')
    let categories = []
    try {
      categories = JSON.parse(content)
    } catch (e) {
      console.error('Error parsing categories file:', e)
      categories = []
    }

    // Check if category already exists
    if (categories.some((c: any) => c.name === name)) {
      throw createError({ statusCode: 400, statusMessage: 'Category already exists' })
    }

    // Generate new ID
    const newId = categories.length > 0 ? Math.max(...categories.map((c: any) => c.id)) + 1 : 1

    // Add new category
    const newCategory = {
      id: newId,
      name,
      image: image || '/placeholder.jpg'
    }

    categories.push(newCategory)

    // Save updated categories
    await fs.writeFile(categoriesFile, JSON.stringify(categories, null, 2), 'utf-8')

    return newCategory
  } catch (e: any) {
    console.error('POST /api/categories error:', e)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: e.statusMessage || 'Internal Server Error',
      data: e.message
    })
  }
}) 