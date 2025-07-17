export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    let imageObserver: IntersectionObserver | null = null;

    // Intersection Observer для lazy loading
    const createImageObserver = () => {
      imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset.src;

              if (src) {
                img.src = src;
                img.removeAttribute("data-src");
                if (imageObserver) {
                  imageObserver.unobserve(img);
                }
              }
            }
          });
        },
        {
          rootMargin: "50px",
          threshold: 0.1,
        }
      );
    };

    // Автоматическое добавление lazy loading для изображений
    const addLazyLoading = () => {
      if (!imageObserver) return;

      const images = document.querySelectorAll("img[data-src]");
      images.forEach((img) => {
        imageObserver!.observe(img);
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
      const criticalImages = ["/images/logo.png"];

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
      createImageObserver();
      addLazyLoading();
      preloadCriticalImages();
      document.addEventListener("error", handleImageError, true);
    };

    // Очистка
    const cleanup = () => {
      if (imageObserver && typeof imageObserver.disconnect === "function") {
        imageObserver.disconnect();
        imageObserver = null;
      }
      document.removeEventListener("error", handleImageError, true);
    };

    // Добавляем инициализацию при загрузке страницы
    nuxtApp.hook("app:mounted", () => {
      initializeImageOptimization();
    });
  }
});
