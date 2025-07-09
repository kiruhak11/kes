import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    // Ожидаем поля: phone, region, typeBuilding, fuelType, powerType, raw_text
    const { phone, region, typeBuilding, fuelType, powerType, raw_text } = body
    const request = await prisma.requests.create({
      data: {
        phone,
        region,
        type_building: typeBuilding,
        fuel_type: fuelType,
        power_type: powerType,
        raw_text,
        type: body.type || 'contact',
        status: 'new',
      }
    })
    return { success: true, request }
  } catch (e: any) {
    console.error('POST /api/requests error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
}) 