interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export const useOptimizedImages = () => {
  // Определяем поддержку форматов
  const supportsWebP = ref(false);
  const supportsAvif = ref(false);

  const checkFormatSupport = async () => {
    if (process.client) {
      // Проверка WebP
      const webpCanvas = document.createElement('canvas');
      webpCanvas.width = 1;
      webpCanvas.height = 1;
      supportsWebP.value = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

      // Проверка AVIF
      try {
        const avifImage = new Image();
        const avifPromise = new Promise((resolve) => {
          avifImage.onload = () => resolve(true);
          avifImage.onerror = () => resolve(false);
        });
        avifImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        supportsAvif.value = await avifPromise as boolean;
      } catch {
        supportsAvif.value = false;
      }
    }
  };

  // Оптимальный формат изображения
  const getOptimalFormat = (originalFormat?: string): string => {
    if (supportsAvif.value) return 'avif';
    if (supportsWebP.value) return 'webp';
    return originalFormat || 'jpg';
  };

  // Адаптивные размеры
  const getResponsiveSizes = (maxWidth: number): string => {
    return `(max-width: 640px) ${Math.min(maxWidth, 640)}px, (max-width: 768px) ${Math.min(maxWidth, 768)}px, (max-width: 1024px) ${Math.min(maxWidth, 1024)}px, ${maxWidth}px`;
  };

  // Оптимизированные параметры изображения
  const getOptimizedImageProps = (src: string, options: ImageOptions = {}) => {
    const {
      width,
      height,
      quality = 85,
      format,
      loading = 'lazy',
      priority = false,
    } = options;

    const optimizedFormat = format || getOptimalFormat();
    const optimizedQuality = priority ? Math.min(quality + 5, 95) : quality;

    return {
      src,
      format: optimizedFormat,
      quality: optimizedQuality,
      width,
      height,
      loading: priority ? 'eager' : loading,
      fetchpriority: priority ? 'high' : 'auto',
      sizes: width ? getResponsiveSizes(width) : undefined,
      placeholder: width && height ? `data:image/svg+xml;base64,${btoa(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>`)}` : undefined,
    };
  };

  // Предзагрузка критических изображений
  const preloadImage = (src: string, options: ImageOptions = {}) => {
    if (process.client && options.priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.fetchPriority = 'high';
      document.head.appendChild(link);
    }
  };

  // Ленивая загрузка с Intersection Observer
  const lazyLoadImage = (img: HTMLImageElement, src: string) => {
    if (!process.client) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const image = entry.target as HTMLImageElement;
            image.src = src;
            image.classList.remove('lazy-loading');
            image.classList.add('lazy-loaded');
            observer.unobserve(image);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );

    img.classList.add('lazy-loading');
    observer.observe(img);
  };

  // Инициализация
  onMounted(() => {
    checkFormatSupport();
  });

  return {
    supportsWebP: readonly(supportsWebP),
    supportsAvif: readonly(supportsAvif),
    getOptimalFormat,
    getResponsiveSizes,
    getOptimizedImageProps,
    preloadImage,
    lazyLoadImage,
  };
};