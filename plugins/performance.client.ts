export default defineNuxtPlugin(() => {
  if (process.client) {
    // Оптимизация скроллинга
    let ticking = false;
    const optimizeScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Здесь можно добавить логику для оптимизации скроллинга
          ticking = false;
        });
        ticking = true;
      }
    };

    // Дебаунс для resize событий
    let resizeTimeout: NodeJS.Timeout;
    const optimizeResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Логика для оптимизации resize
        window.dispatchEvent(new Event('optimizedResize'));
      }, 150);
    };

    // Оптимизация изображений с Intersection Observer
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );

    // Наблюдение за изображениями с data-src
    const observeImages = () => {
      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });
    };

    // Оптимизация анимаций
    const optimizeAnimations = () => {
      // Отключаем анимации при слабом устройстве
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.documentElement.style.setProperty('--animation-duration', '0s');
      }

      // Отключаем анимации при низком заряде батареи
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          if (battery.level < 0.2) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
          }
        });
      }
    };

    // Оптимизация памяти
    const optimizeMemory = () => {
      // Очистка неиспользуемых ресурсов каждые 5 минут
      setInterval(() => {
        if ('gc' in window && typeof (window as any).gc === 'function') {
          (window as any).gc();
        }
      }, 300000);
    };

    // Инициализация оптимизаций
    nextTick(() => {
      window.addEventListener('scroll', optimizeScroll, { passive: true });
      window.addEventListener('resize', optimizeResize, { passive: true });
      observeImages();
      optimizeAnimations();
      optimizeMemory();
    });

    // Очистка при размонтировании
    onBeforeUnmount(() => {
      window.removeEventListener('scroll', optimizeScroll);
      window.removeEventListener('resize', optimizeResize);
      imageObserver.disconnect();
    });
  }
});