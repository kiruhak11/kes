interface ScrollOptions {
  throttle?: number;
  passive?: boolean;
}

export const useOptimizedScroll = (options: ScrollOptions = {}) => {
  const { throttle = 16, passive = true } = options;

  const scrollY = ref(0);
  const scrollDirection = ref<'up' | 'down'>('down');
  const isScrolling = ref(false);
  
  let lastScrollY = 0;
  let ticking = false;
  let scrollTimeout: NodeJS.Timeout;

  // Оптимизированный обработчик скролла
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        scrollY.value = currentScrollY;
        scrollDirection.value = currentScrollY > lastScrollY ? 'down' : 'up';
        lastScrollY = currentScrollY;
        
        isScrolling.value = true;
        
        // Сбрасываем флаг скроллинга через некоторое время
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling.value = false;
        }, 150);
        
        ticking = false;
      });
      ticking = true;
    }
  };

  // Плавный скролл к элементу
  const scrollToElement = (
    element: HTMLElement | string,
    options: ScrollIntoViewOptions = {}
  ) => {
    const target = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement
      : element;

    if (target) {
      // Используем современный API если доступен
      if ('scrollBehavior' in document.documentElement.style) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          ...options,
        });
      } else {
        // Fallback для старых браузеров
        const targetPosition = target.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 500;
        let start: number;

        const step = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const percentage = Math.min(progress / duration, 1);
          
          // Easing function
          const ease = percentage < 0.5 
            ? 2 * percentage * percentage 
            : 1 - Math.pow(-2 * percentage + 2, 2) / 2;
          
          window.scrollTo(0, startPosition + distance * ease);
          
          if (progress < duration) {
            requestAnimationFrame(step);
          }
        };
        
        requestAnimationFrame(step);
      }
    }
  };

  // Виртуализация для длинных списков
  const useVirtualScroll = (
    items: Ref<any[]>,
    itemHeight: number,
    containerHeight: number
  ) => {
    const startIndex = computed(() => {
      return Math.floor(scrollY.value / itemHeight);
    });

    const endIndex = computed(() => {
      return Math.min(
        startIndex.value + Math.ceil(containerHeight / itemHeight) + 1,
        items.value.length
      );
    });

    const visibleItems = computed(() => {
      return items.value.slice(startIndex.value, endIndex.value);
    });

    const offsetY = computed(() => {
      return startIndex.value * itemHeight;
    });

    const totalHeight = computed(() => {
      return items.value.length * itemHeight;
    });

    return {
      visibleItems,
      offsetY,
      totalHeight,
      startIndex,
      endIndex,
    };
  };

  // Определение видимости элемента
  const useElementVisibility = (element: Ref<HTMLElement | null>) => {
    const isVisible = ref(false);
    let observer: IntersectionObserver;

    watchEffect(() => {
      if (process.client && element.value) {
        observer = new IntersectionObserver(
          ([entry]) => {
            isVisible.value = entry.isIntersecting;
          },
          {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px',
          }
        );

        observer.observe(element.value);
      }
    });

    onUnmounted(() => {
      if (observer) {
        observer.disconnect();
      }
    });

    return { isVisible };
  };

  // Инициализация
  onMounted(() => {
    if (process.client) {
      window.addEventListener('scroll', handleScroll, { passive });
      
      // Инициализируем начальные значения
      scrollY.value = window.pageYOffset || document.documentElement.scrollTop;
      lastScrollY = scrollY.value;
    }
  });

  onUnmounted(() => {
    if (process.client) {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    }
  });

  return {
    scrollY: readonly(scrollY),
    scrollDirection: readonly(scrollDirection),
    isScrolling: readonly(isScrolling),
    scrollToElement,
    useVirtualScroll,
    useElementVisibility,
  };
};