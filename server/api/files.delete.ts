import { getQuery, createError } from 'h3'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const query = getQuery(event)
    const fileName = query.fileName as string

    if (!fileName) {
      throw createError({
        statusCode: 400,
        message: 'File name is required'
      })
    }

    // Проверяем, что путь безопасный (только имя файла)
    if (fileName.includes('/') || fileName.includes('\\')) {
      throw createError({
        statusCode: 400,
        message: 'Invalid file name'
      })
    }

    // Удаляем файл из корневой папки
    await deleteFile(fileName, '/')

    return {
      success: true,
      message: 'File deleted successfully'
    }

  } catch (error: any) {
    console.error('Error deleting file:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error deleting file'
    })
  }
}) 
