import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw new Error('No form data received')
    }

    const file = formData[0]
    if (!file || !file.filename) {
      throw new Error('No file uploaded')
    }

    // Создаем уникальное имя файла
    const ext = file.filename.split('.').pop()
    const filename = `${randomUUID()}.${ext}`
    
    // Путь для сохранения файла
    const uploadDir = join(process.cwd(), 'public', 'uploads')
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