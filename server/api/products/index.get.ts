import { defineEventHandler, createError } from 'h3'
import { promises as fs } from 'fs'
import { resolve, dirname } from 'path'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const category = query.category as string | undefined

    const filePath = resolve(process.cwd(), 'data/products.json')
    
    // Проверяем, существует ли файл
    let content: string
    try {
      content = await fs.readFile(filePath, 'utf-8')
    } catch (readError: any) {
      if (readError.code === 'ENOENT') { // Если файл не найден
        console.warn('products.json not found, initializing with empty array.')
        const dirPath = dirname(filePath)
        await fs.mkdir(dirPath, { recursive: true }).catch(() => {}) // Создаем директорию, если ее нет
        await fs.writeFile(filePath, '[]', 'utf-8') // Создаем файл с пустым массивом
        content = '[]'
      } else {
        throw readError // Перебрасываем другие ошибки чтения
      }
    }
    
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
