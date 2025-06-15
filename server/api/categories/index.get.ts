import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    // Получаем только нужные поля для категорий
    const { data: products, error } = await client.from('products').select('category, category_slug, image')
    if (error) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch categories from Supabase' })
    }
    // Собираем уникальные категории
    const map = new Map()
    for (const p of products || []) {
      if (!p.category || !p.category_slug) continue
      if (!map.has(p.category_slug)) {
        map.set(p.category_slug, {
          title: p.category,
          slug: p.category_slug,
          image: p.image,
          description: `Товары категории ${p.category}`
        })
      }
    }
    return Array.from(map.values())
  } catch (e) {
    console.error('GET /api/categories error:', e)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
}) 