export default defineEventHandler(async (event) => {
  try {
    // Получаем все файлы из корневой папки uploads
    const files = await getFilesLocally('/')

    // Преобразуем пути в URL для фронтенда
    const fileList = files.map(filePath => {
      const fileName = filePath.split('/').pop()
      return {
        name: fileName,
        path: `/uploads/${fileName}`,
        fullPath: filePath
      }
    })

    return {
      success: true,
      files: fileList
    }

  } catch (error: any) {
    console.error('Error getting files:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error getting files'
    })
  }
}) 