import { ref } from 'vue'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  category_slug: string
  specs: any
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ProductsResponse {
  products: Product[]
  pagination: Pagination
}

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useProducts = () => {
  const products = ref<Product[]>([])
  const pagination = ref<Pagination | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getCacheKey = (categorySlug?: string, page: number = 1, limit: number = 10) => {
    return `products:${categorySlug || 'all'}:${page}:${limit}`
  }

  const fetchProducts = async (categorySlug?: string, page: number = 1, limit: number = 10) => {
    loading.value = true
    error.value = null

    try {
      const cacheKey = getCacheKey(categorySlug, page, limit)
      const cached = cache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        const response = cached.data as ProductsResponse
        products.value = response.products
        pagination.value = response.pagination
        return
      }

      const query = new URLSearchParams()
      if (categorySlug) query.append('categorySlug', categorySlug)
      query.append('page', page.toString())
      query.append('limit', limit.toString())

      const { data } = await useFetch<ProductsResponse>(`/api/products?${query.toString()}`)
      
      if (data.value) {
        products.value = data.value.products
        pagination.value = data.value.pagination
        cache.set(cacheKey, { data: data.value, timestamp: Date.now() })
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch products'
    } finally {
      loading.value = false
    }
  }

  const clearCache = () => {
    cache.clear()
  }

  return {
    products,
    pagination,
    loading,
    error,
    fetchProducts,
    clearCache
  }
} 