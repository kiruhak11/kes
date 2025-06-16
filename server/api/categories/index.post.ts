import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody<{ title: string; slug: string }>(event)

    if (!body.title || !body.slug) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Bad Request: title and slug are required' 
      })
    }

    // Пока категории хранятся имплицитно через товары, нам не нужно ничего создавать.
    // Просто возвращаем объект категории, чтобы фронтенд мог продолжить работу.
    // Категория появится в выдаче, как только будет добавлен хотя бы один товар с этим category_slug.

    return {
      title: body.title,
      slug: body.slug
    }
  } catch (e: any) {
    console.error('POST /api/categories error:', e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
}) 