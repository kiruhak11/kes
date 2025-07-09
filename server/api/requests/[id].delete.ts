import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const requestId = event.context.params?.id
    if (!requestId) {
      throw createError({ statusCode: 400, statusMessage: 'Request ID is required' })
    }
    await prisma.requests.delete({ where: { id: BigInt(requestId) } })
    return { success: true }
  } catch (e: any) {
    console.error('DELETE /api/requests/[id] error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 