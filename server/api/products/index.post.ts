import { defineEventHandler, readBody, createError } from 'h3'
import { promises as fs } from 'fs'
import { resolve, dirname } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ 
      name?: string; 
      description?: string; 
      price?: number; 
      image?: string;
      category?: string;
      extendedDescription?: string;
      specs?: Record<string, any>;
    }>(event)
    
    if (!body.name || !body.description || typeof body.price !== 'number' || !body.category) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Bad Request: name, description, price and category are required' 
      })
    }

    const filePath = resolve(process.cwd(), 'data/products.json')
    
    // Проверяем, существует ли файл и считываем его содержимое
    let content: string
    try {
      content = await fs.readFile(filePath, 'utf-8')
    } catch (readError: any) {
      if (readError.code === 'ENOENT') { // Если файл не найден
        console.warn('products.json not found, initializing with empty array for POST request.')
        const dirPath = dirname(filePath)
        await fs.mkdir(dirPath, { recursive: true }).catch(() => {}) // Создаем директорию, если ее нет
        await fs.writeFile(filePath, '[]', 'utf-8') // Создаем файл с пустым массивом
        content = '[]'
      } else {
        throw readError // Перебрасываем другие ошибки чтения
      }
    }

    const products = JSON.parse(content) as any[]

    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1
    
    // Ensure specs exist and default power/fuel if not provided
    const newSpecs = body.specs || {};
    if (!newSpecs.power) {
      newSpecs.power = 'отсутствует';
    }
    if (!newSpecs.fuel) {
      newSpecs.fuel = 'отсутствует';
    }

    const newProd = { 
      id: newId, 
      ...body,
      image: body.image || '/placeholder.jpg',
      specs: newSpecs, // Use the potentially modified newSpecs
    }
    products.push(newProd)

    await fs.writeFile(filePath, JSON.stringify(products, null, 2), 'utf-8')
    return newProd
  } catch (e: any) {
    console.error('POST /api/products error:', e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
})
