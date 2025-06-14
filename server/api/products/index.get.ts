import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const query = getQuery(event)
    const categorySlug = query.categorySlug as string | undefined

    let dbQuery = client.from('products').select('*')

    if (categorySlug) {
      dbQuery = dbQuery.eq('category_slug', categorySlug)
    }

    const { data: products, error } = await dbQuery

    if (error) {
      console.error('Supabase query error:', error.message)
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch products from Supabase' })
    }

    return products
  } catch (e: any) {
    console.error('GET /api/products error:', e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
})
