import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const id = Number(event.context.params?.id)
    const body = await readBody<Partial<{ name: string; description: string; price: number; image: string; specs: Record<string,string> }>>(event)

    const { data, error } = await client.from('products')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error.message)
      throw createError({ statusCode: 500, statusMessage: 'Failed to update product in Supabase' })
    }

    if (!data) {
        throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    }

    return data
  } catch (e: any) {
    console.error(`PUT /api/products/${event.context.params?.id} error:`, e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
})
