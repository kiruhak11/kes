import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)

    // Получаем все продукты
    const { data: products, error: productsError } = await client
      .from('products')
      .select('id, specs')

    if (productsError) {
      console.error('Error fetching products:', productsError)
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch products' })
    }

    let updatedCount = 0

    // Обновляем каждый продукт
    for (const product of products) {
      if (product.specs && Array.isArray(product.specs)) {
        // Добавляем поле show_in_filters к каждой характеристике
        const updatedSpecs = product.specs.map((spec: any) => ({
          ...spec,
          show_in_filters: spec.show_in_filters !== undefined ? spec.show_in_filters : false
        }))

        // Обновляем продукт в базе данных
        const { error: updateError } = await client
          .from('products')
          .update({ specs: updatedSpecs })
          .eq('id', product.id)

        if (updateError) {
          console.error(`Error updating product ${product.id}:`, updateError)
        } else {
          updatedCount++
        }
      }
    }

    return {
      success: true,
      message: `Updated ${updatedCount} products`,
      updatedCount
    }
  } catch (e: any) {
    console.error('Error updating specs:', e)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: e.statusMessage || 'Internal Server Error' 
    })
  }
}) 