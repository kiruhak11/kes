import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { getQuery } from 'h3'

interface ProductSpecs {
  power?: string
  fuel?: string[] | string
  [key: string]: any
}

interface Product {
  id: number
  name: string | null
  description: string | null
  price: number | null
  image: string | null
  category: string | null
  category_slug: string | null | undefined
  specs: ProductSpecs
}

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const query = getQuery(event)
    const categorySlug = query.categorySlug as string | undefined
    const productSlug = query.productSlug as string | undefined
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const offset = (page - 1) * limit

    // Build the base query with only necessary fields
    let dbQuery = client
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        image,
        category,
        category_slug,
        specs
      `, { count: 'exact' })

    // Add category filter if not 'all'
    if (categorySlug && categorySlug !== 'all') {
      dbQuery = dbQuery.eq('category_slug', categorySlug)
    }

    // Add product filter if provided and valid
    if (productSlug && productSlug !== 'undefined') {
      const productId = parseInt(productSlug)
      if (!isNaN(productId)) {
        dbQuery = dbQuery.eq('id', productId)
      }
    }

    // Add pagination and ordering
    const { data: products, error, count } = await dbQuery
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Supabase query error:', error.message)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to fetch products from Supabase',
        data: { error: error.message }
      })
    }

    if (!products || products.length === 0) {
      return {
        products: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      }
    }

    // Transform the data to ensure consistent structure
    const transformedProducts = products.map((product) => ({
      ...product,
      specs: {
        ...(product.specs as Record<string, any> || {}),
        power: (product.specs as any)?.power || 'отсутствует',
        fuel: Array.isArray((product.specs as any)?.fuel) 
          ? (product.specs as any).fuel 
          : typeof (product.specs as any)?.fuel === 'string' 
            ? (product.specs as any).fuel.split(', ').map((f: string) => f.trim())
            : ['отсутствует']
      }
    }))

    return {
      products: transformedProducts,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  } catch (e: any) {
    console.error('GET /api/products error:', e)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: e.statusMessage || 'Internal Server Error',
      data: e.data
    })
  }
})
