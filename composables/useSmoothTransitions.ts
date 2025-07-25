export const useSmoothTransitions = () => {
  const isTransitioning = ref(false);
  const transitionProgress = ref(0);

  // Плавный переход между страницами
  const smoothPageTransition = async (to: string) => {
    if (process.client) {
      isTransitioning.value = true;
      transitionProgress.value = 0;

      // Анимация прогресса
      const progressInterval = setInterval(() => {
        if (transitionProgress.value < 90) {
          transitionProgress.value += Math.random() * 30;
        }
      }, 100);

      try {
        // Предзагружаем следующую страницу
        await navigateTo(to);
        
        // Завершаем прогресс
        transitionProgress.value = 100;
        
        setTimeout(() => {
          isTransitioning.value = false;
          transitionProgress.value = 0;
        }, 300);
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        clearInterval(progressInterval);
      }
    }
  };

  // Плавная загрузка изображений
  const smoothImageLoad = (img: HTMLImageElement) => {
    return new Promise<void>((resolve) => {
      if (img.complete) {
        resolve();
        return;
      }

      // Добавляем класс загрузки
      img.classList.add('image-loading');
      
      const onLoad = () => {
        img.classList.remove('image-loading');
        img.classList.add('image-loaded');
        resolve();
      };

      const onError = () => {
        img.classList.remove('image-loading');
        img.classList.add('image-error');
        resolve();
      };

      img.addEventListener('load', onLoad, { once: true });
      img.addEventListener('error', onError, { once: true });
    });
  };

  // Плавное появление контента
  const smoothContentReveal = (element: HTMLElement, delay = 0) => {
    if (process.client) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, delay);
    }
  };

  // Скелетон для загрузки
  const createSkeleton = (container: HTMLElement, type: 'card' | 'text' | 'image' = 'card') => {
    const skeleton = document.createElement('div');
    skeleton.className = `skeleton skeleton-${type}`;
    
    if (type === 'card') {
      skeleton.innerHTML = `
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
        </div>
      `;
    } else if (type === 'text') {
      skeleton.innerHTML = `
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      `;
    } else if (type === 'image') {
      skeleton.innerHTML = `<div class="skeleton-image-placeholder"></div>`;
    }

    container.appendChild(skeleton);
    return skeleton;
  };

  // Удаление скелетона
  const removeSkeleton = (skeleton: HTMLElement) => {
    skeleton.style.opacity = '0';
    setTimeout(() => {
      skeleton.remove();
    }, 300);
  };

  return {
    isTransitioning: readonly(isTransitioning),
    transitionProgress: readonly(transitionProgress),
    smoothPageTransition,
    smoothImageLoad,
    smoothContentReveal,
    createSkeleton,
    removeSkeleton,
  };
};