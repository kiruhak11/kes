import { readdir } from 'fs/promises'
import { join } from 'path'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    
    // Получаем список файлов в папке uploads
    const files = await readdir(uploadDir)
    
    // Фильтруем только файлы (не папки)
    const fileList = []
    for (const file of files) {
      const filePath = join(uploadDir, file)
      const stats = await import('fs').then(fs => fs.promises.stat(filePath))
      if (stats.isFile()) {
        fileList.push({
          name: file,
          path: `/uploads/${file}`,
          size: stats.size,
          created: stats.birthtime
        })
      }
    }

    return {
      success: true,
      uploadDir,
      files: fileList,
      totalFiles: fileList.length
    }

  } catch (error: any) {
    console.error('Error testing files:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error testing files'
    })
  }
}) 
