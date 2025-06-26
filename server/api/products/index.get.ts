import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { getQuery } from 'h3'
import type { Database } from '~/types/database.types'
import { convertSpecsToCharacteristics } from '~/utils/characteristics'

type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']

interface ProductWithCategory extends Omit<Product, 'category'> {
  category?: Category | null
}

interface ProductSpecs {
  power?: string
  fuel?: string[] | string
  [key: string]: any
}

interface ProductWithCharacteristics extends Omit<Product, 'specs'> {
  specs?: Characteristic[]
  category_name?: string
  category_slug?: string
  slug?: string
}

interface Characteristic {
  id: number
  key: string
  value: string
}

function generateSlug(text: string): string {
  // Транслитерация кириллицы
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh',
    'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  }

  return text
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default defineEventHandler(async (event) => {
  try { 
    const client = await serverSupabaseClient<Database>(event)
    const query = getQuery(event)
    const categorySlug = query.categorySlug as string | undefined
    const productSlug = query.productSlug as string | undefined
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const offset = (page - 1) * limit
 

    // Build the base query
    let dbQuery = client
      .from('products')
      .select(`
        *,
        categories!products_category_id_fkey (
          id,
          name,
          slug
        )
      `, { count: 'exact' })

    // Add category filter if not 'all'
    if (categorySlug && categorySlug !== 'all') {
      dbQuery = dbQuery.eq('categories.slug', categorySlug)
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
      console.error('Supabase query error:', error)
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

    // Transform products to include category info and convert specs
    const transformedProducts: ProductWithCharacteristics[] = products.map(product => {
      const category = product.categories as any
      
      // Debug: Log the original specs format
      console.log('Original specs for product', product.id, ':', product.specs)
      
      // Convert specs from object to characteristics array
      const characteristics = convertSpecsToCharacteristics(product.specs as Record<string, any>)
      
      // Debug: Log the converted characteristics
      console.log('Converted characteristics for product', product.id, ':', characteristics)
      
      // Ensure characteristics is always an array
      const finalSpecs = Array.isArray(characteristics) ? characteristics : []
      
      return {
        ...product,
        category_name: category?.name || '',
        category_slug: category?.slug || '',
        slug: product.name ? product.name.toLowerCase().replace(/\s+/g, '-') : '',
        specs: finalSpecs
      }
    })

    const totalPages = Math.ceil((count || 0) / limit)

    return {
      products: transformedProducts,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages
      }
    }
  } catch (e: any) {
    console.error('GET /api/products error:', e)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: e.statusMessage || 'Internal Server Error' 
    })
  }
})
