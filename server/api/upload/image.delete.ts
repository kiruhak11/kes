import { unlink } from 'fs/promises'
import { join } from 'path'
import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const fileName = query.path as string

    if (!fileName) {
      throw createError({
        statusCode: 400,
        message: 'File path is required'
      })
    }

    // Проверяем, что путь безопасный (только имя файла)
    if (fileName.includes('/') || fileName.includes('\\')) {
      throw createError({
        statusCode: 400,
        message: 'Invalid file path'
      })
    }

    const filePath = join(process.cwd(), 'public', 'uploads', fileName)

    await unlink(filePath)

    return {
      success: true
    }
  } catch (error: any) {
    console.error('Error deleting file:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error deleting file'
    })
  }
}) 