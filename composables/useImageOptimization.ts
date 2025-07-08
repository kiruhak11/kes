import { computed } from 'vue'

export const useImageOptimization = () => {
  // Генерация srcset для responsive изображений
  const generateSrcSet = (src: string, widths: number[] = [320, 640, 960, 1280]) => {
    return widths
      .map(width => `${src}?w=${width} ${width}w`)
      .join(', ')
  }

  // Оптимизация размера изображения
  const optimizeImageSize = (src: string, width: number, height?: number) => {
    const params = new URLSearchParams()
    params.append('w', width.toString())
    if (height) {
      params.append('h', height.toString())
    }
    params.append('q', '80')
    params.append('f', 'webp')
    
    return `${src}?${params.toString()}`
  }

  // Lazy loading для изображений
  const createLazyImage = (src: string, alt: string, options: {
    width?: number
    height?: number
    placeholder?: string
  } = {}) => {
    return {
      src,
      alt,
      loading: 'lazy' as const,
      decoding: 'async' as const,
      ...options,
    }
  }

  // Предзагрузка изображений
  const preloadImage = (src: string) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
      img.src = src
    })
  }

  // Оптимизация фоновых изображений
  const optimizeBackgroundImage = (src: string, size: 'cover' | 'contain' = 'cover') => {
    return {
      backgroundImage: `url(${src})`,
      backgroundSize: size,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }

  return {
    generateSrcSet,
    optimizeImageSize,
    createLazyImage,
    preloadImage,
    optimizeBackgroundImage,
  }
} 