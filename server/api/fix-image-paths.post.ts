import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const supabaseKey = config.public.supabaseKey

    if (!supabaseUrl || !supabaseKey) {
      throw createError({
        statusCode: 500,
        message: 'Supabase configuration is missing'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Получаем все товары
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')

    if (productsError) {
      throw createError({
        statusCode: 500,
        message: `Error fetching products: ${productsError.message}`
      })
    }

    let updatedCount = 0
    const updates = []

    for (const product of products || []) {
      let needsUpdate = false
      const updateData: any = { id: product.id }

      // Исправляем основное изображение
      if (product.image && product.image.includes('/uploads/userFiles/')) {
        updateData.image = product.image.replace('/uploads/userFiles/', '/uploads/')
        needsUpdate = true
      }

      // Исправляем дополнительные изображения
      if (product.additional_images && Array.isArray(product.additional_images)) {
        const fixedImages = product.additional_images.map((img: string) => 
          img.replace('/uploads/userFiles/', '/uploads/')
        )
        if (JSON.stringify(fixedImages) !== JSON.stringify(product.additional_images)) {
          updateData.additional_images = fixedImages
          needsUpdate = true
        }
      }

      // Исправляем изображения в specs
      if (product.specs && product.specs.images && Array.isArray(product.specs.images)) {
        const fixedSpecImages = product.specs.images.map((img: string) => 
          img.replace('/uploads/userFiles/', '/uploads/')
        )
        if (JSON.stringify(fixedSpecImages) !== JSON.stringify(product.specs.images)) {
          updateData.specs = { ...product.specs, images: fixedSpecImages }
          needsUpdate = true
        }
      }

      if (needsUpdate) {
        updates.push(updateData)
      }
    }

    // Выполняем обновления
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('products')
        .update(update)
        .eq('id', update.id)

      if (updateError) {
        console.error(`Error updating product ${update.id}:`, updateError)
      } else {
        updatedCount++
      }
    }

    return {
      success: true,
      totalProducts: products?.length || 0,
      updatedProducts: updatedCount,
      updates
    }

  } catch (error: any) {
    console.error('Error fixing image paths:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error fixing image paths'
    })
  }
}) 