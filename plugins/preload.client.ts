export default defineNuxtPlugin(() => {
  // Предзагрузка критических ресурсов
  const preloadResources = () => {
    // Предзагрузка шрифтов
    const fontLink = document.createElement('link')
    fontLink.rel = 'preload'
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'
    fontLink.as = 'style'
    document.head.appendChild(fontLink)

    // Предзагрузка критических изображений
    const criticalImages = [
      '/images/logo.png',
      '/images/hero-bg.jpg',
    ]

    criticalImages.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = src
      link.as = 'image'
      document.head.appendChild(link)
    })
  }

  // Предзагрузка при загрузке страницы
  if (process.client) {
    preloadResources()
  }

  // Предзагрузка при навигации
  const router = useRouter()
  router.beforeEach((to, from) => {
    // Предзагрузка ресурсов для следующей страницы
    if (to.path !== from.path) {
      // Можно добавить логику предзагрузки для конкретных страниц
      console.log('Preloading resources for:', to.path)
    }
  })
}) 