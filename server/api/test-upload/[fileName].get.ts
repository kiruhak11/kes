import { readFile, access } from 'fs/promises'
import { join } from 'path'
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const fileName = getRouterParam(event, 'fileName')
    
    if (!fileName) {
      throw createError({
        statusCode: 400,
        message: 'File name is required'
      })
    }

    const filePath = join(process.cwd(), 'public', 'uploads', fileName)
    
    // Проверяем существование файла
    try {
      await access(filePath)
    } catch (accessError) {
      console.error('File access error:', filePath, accessError)
      throw createError({
        statusCode: 404,
        message: `File not found: ${fileName}`
      })
    }

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
      setHeader(event, 'Cache-Control', 'public, max-age=31536000')
      
      return fileBuffer
      
    } catch (fileError) {
      console.error('File read error:', filePath, fileError)
      throw createError({
        statusCode: 500,
        message: 'Error reading file'
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
