import { readFile } from 'fs/promises'
import { join } from 'path'
import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const fileName = getRouterParam(event, 'fileName')
    
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

    const filePath = join(process.cwd(), 'public', 'uploads', fileName)
    
    try {
      const fileBuffer = await readFile(filePath)
      
      // Определяем MIME тип по расширению
      const ext = fileName.split('.').pop()?.toLowerCase()
      let mimeType = 'application/octet-stream'
      
      if (ext === 'png') mimeType = 'image/png'
      else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg'
      else if (ext === 'gif') mimeType = 'image/gif'
      else if (ext === 'webp') mimeType = 'image/webp'
      else if (ext === 'svg') mimeType = 'image/svg+xml'
      
      setHeader(event, 'Content-Type', mimeType)
      setHeader(event, 'Cache-Control', 'public, max-age=31536000') // 1 год
      
      return fileBuffer
      
    } catch (fileError) {
      console.error('File not found:', filePath, fileError)
      throw createError({
        statusCode: 404,
        message: 'File not found'
      })
    }

  } catch (error: any) {
    console.error('Error serving file:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error serving file'
    })
  }
}) 