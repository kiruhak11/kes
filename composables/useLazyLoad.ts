import { ref, onMounted, onUnmounted } from 'vue'

export const useLazyLoad = () => {
  const isVisible = ref(false)
  const elementRef = ref<HTMLElement | null>(null)

  const observer = ref<IntersectionObserver | null>(null)

  onMounted(() => {
    if (!elementRef.value) return

    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            observer.value?.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    )

    observer.value.observe(elementRef.value)
  })

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  return {
    isVisible: readonly(isVisible),
    elementRef,
  }
}

// Composable для ленивой загрузки изображений
export const useLazyImage = () => {
  const imageRef = ref<HTMLImageElement | null>(null)
  const isLoaded = ref(false)
  const isError = ref(false)

  const loadImage = (src: string) => {
    if (!imageRef.value) return

    const img = new Image()
    img.onload = () => {
      isLoaded.value = true
      if (imageRef.value) {
        imageRef.value.src = src
      }
    }
    img.onerror = () => {
      isError.value = true
    }
    img.src = src
  }

  return {
    imageRef,
    isLoaded: readonly(isLoaded),
    isError: readonly(isError),
    loadImage,
  }
} 