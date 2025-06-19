import { ServerFile } from "nuxt-file-storage";

export default defineEventHandler(async (event) => {
  try {
    const { files } = await readBody<{ files: ServerFile[] }>(event)

    if (!files || !Array.isArray(files) || files.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No files provided'
      })
    }

    const uploadedFiles = []

    for (const file of files) {
      // Проверяем, что файл является изображением
      if (!file.type?.startsWith('image/')) {
        throw createError({
          statusCode: 400,
          message: 'Only image files are allowed'
        })
      }

      // Сохраняем файл с уникальным именем в корневую папку uploads
      const fileName = await storeFileLocally(
        file,
        12, // длина уникального ID
        '/' // корневая папка для сохранения
      )

      uploadedFiles.push({
        path: `/api/uploads/${fileName}`,
        originalName: file.name,
        size: file.size,
        type: file.type
      })
    }

    return {
      success: true,
      files: uploadedFiles
    }

  } catch (error: any) {
    console.error('Error uploading files:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error uploading files'
    })
  }
}) 