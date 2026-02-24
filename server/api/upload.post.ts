import { writeFile } from 'fs/promises'
import { join, basename } from 'path'
import { randomUUID } from 'crypto'
import { mkdir } from 'fs/promises'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)

    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw new Error('No form data received')
    }

    const file = formData[0]
    if (!file || !file.filename) {
      throw new Error('No file uploaded')
    }

    // Создаем уникальное имя файла
    const safeOriginalName = basename(file.filename)
    const ext = safeOriginalName.split('.').pop()?.toLowerCase() || ''
    const allowedExt = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'])
    if (!allowedExt.has(ext)) {
      throw createError({
        statusCode: 400,
        message: 'Unsupported file extension'
      })
    }

    const filename = `${randomUUID()}.${ext}`
    
    // Путь для сохранения файла
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    const filepath = join(uploadDir, filename)

    // Сохраняем файл
    await writeFile(filepath, file.data)

    // Возвращаем URL для доступа к файлу
    return {
      url: `/uploads/${filename}`
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to upload file'
    })
  }
}) 
