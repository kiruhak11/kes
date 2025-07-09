export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    // Intersection Observer для lazy loading
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;

            if (src) {
              img.src = src;
              img.removeAttribute("data-src");
              imageObserver.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    // Автоматическое добавление lazy loading для изображений
    const addLazyLoading = () => {
      const images = document.querySelectorAll("img[data-src]");
      images.forEach((img) => {
        imageObserver.observe(img);
      });
    };

    // Оптимизация размера изображений
    const optimizeImageSize = (img: HTMLImageElement) => {
      const container = img.closest(".container") || document.body;
      const containerWidth = container.clientWidth;

      // Установка оптимального размера
      if (img.naturalWidth > containerWidth) {
        img.style.width = "100%";
        img.style.height = "auto";
      }
    };

    // Предзагрузка критических изображений
    const preloadCriticalImages = () => {
      const criticalImages = ["/images/logo.png", "/images/hero-bg.jpg"];

      criticalImages.forEach((src) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.href = src;
        link.as = "image";
        document.head.appendChild(link);
      });
    };

    // Обработка ошибок загрузки изображений
    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement;
      img.style.display = "none";
      console.warn("Failed to load image:", img.src);
    };

    // Инициализация при загрузке страницы
    const initializeImageOptimization = () => {
      addLazyLoading();
      preloadCriticalImages();
      document.addEventListener("error", handleImageError, true);
    };

    // Очистка
    const cleanup = () => {
      imageObserver.disconnect();
      document.removeEventListener("error", handleImageError, true);
    };

    // Добавляем инициализацию и очистку к хукам nuxtApp
    nuxtApp.hook("app:mounted", () => {
      initializeImageOptimization();
    });

    nuxtApp.hook("app:beforeMount", () => {
      cleanup();
    });
  }
});
