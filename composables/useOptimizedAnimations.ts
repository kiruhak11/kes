interface AnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  delay?: number;
  duration?: number;
}

export const useOptimizedAnimations = () => {
  const isReducedMotion = ref(false);
  const isLowPerformance = ref(false);

  // Проверяем предпочтения пользователя и производительность устройства
  const checkPerformance = () => {
    if (process.client) {
      // Проверяем предпочтения пользователя
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      isReducedMotion.value = mediaQuery.matches;

      // Проверяем производительность устройства
      const connection = (navigator as any).connection;
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      
      isLowPerformance.value = 
        hardwareConcurrency < 4 || 
        (connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g'));

      // Слушаем изменения предпочтений
      mediaQuery.addEventListener('change', (e) => {
        isReducedMotion.value = e.matches;
      });
    }
  };

  // Оптимизированный scroll reveal
  const createScrollReveal = (options: AnimationOptions = {}) => {
    const {
      threshold = 0.1,
      rootMargin = '0px 0px -50px 0px',
      once = true,
      delay = 0,
      duration = 600,
    } = options;

    if (process.client && !isReducedMotion.value && !isLowPerformance.value) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              
              // Применяем анимацию с оптимизацией
              requestAnimationFrame(() => {
                element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                element.style.transitionDelay = `${delay}ms`;
                element.classList.add('animate-in');
              });

              if (once) {
                observer.unobserve(element);
              }
            }
          });
        },
        {
          threshold,
          rootMargin,
        }
      );

      return observer;
    }

    // Возвращаем пустой observer для слабых устройств
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    };
  };

  // Директива для scroll reveal
  const vScrollReveal = {
    mounted(el: HTMLElement, binding: any) {
      if (isReducedMotion.value || isLowPerformance.value) {
        el.classList.add('animate-in');
        return;
      }

      const animationType = binding.value || 'fade-in';
      el.classList.add('animate-out', `animate-${animationType}`);

      const observer = createScrollReveal(binding.modifiers);
      observer.observe(el);

      // Сохраняем observer для очистки
      (el as any)._scrollRevealObserver = observer;
    },
    unmounted(el: HTMLElement) {
      if ((el as any)._scrollRevealObserver) {
        (el as any)._scrollRevealObserver.disconnect();
      }
    },
  };

  // Оптимизированная анимация hover
  const optimizedHover = (element: HTMLElement, className: string) => {
    if (isReducedMotion.value || isLowPerformance.value) return;

    let isHovering = false;
    
    const handleMouseEnter = () => {
      if (!isHovering) {
        isHovering = true;
        requestAnimationFrame(() => {
          element.classList.add(className);
        });
      }
    };

    const handleMouseLeave = () => {
      if (isHovering) {
        isHovering = false;
        requestAnimationFrame(() => {
          element.classList.remove(className);
        });
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    element.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  };

  // Инициализация
  onMounted(() => {
    checkPerformance();
  });

  return {
    isReducedMotion: readonly(isReducedMotion),
    isLowPerformance: readonly(isLowPerformance),
    createScrollReveal,
    vScrollReveal,
    optimizedHover,
  };
};