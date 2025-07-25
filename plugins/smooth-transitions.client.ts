export default defineNuxtPlugin(() => {
  if (process.client) {
    const { smoothImageLoad, smoothContentReveal } = useSmoothTransitions();

    // Инициализация плавных переходов
    const initSmoothTransitions = () => {
      // Плавная загрузка всех изображений
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        smoothImageLoad(img as HTMLImageElement);
      });

      // Плавное появление контента
      const contentElements = document.querySelectorAll('.fade-in-content');
      contentElements.forEach((el, index) => {
        smoothContentReveal(el as HTMLElement, index * 100);
      });

      // Добавляем индикатор загрузки страницы
      const progressBar = document.createElement('div');
      progressBar.className = 'page-progress-bar';
      progressBar.innerHTML = '<div class="progress-fill"></div>';
      document.body.appendChild(progressBar);
    };

    // Обработчик навигации
    const router = useRouter();
    router.beforeEach((to, from) => {
      if (to.path !== from.path) {
        // Показываем индикатор загрузки
        const progressBar = document.querySelector('.page-progress-bar') as HTMLElement;
        if (progressBar) {
          progressBar.classList.add('loading');
        }

        // Добавляем класс перехода к body
        document.body.classList.add('page-transitioning');
      }
    });

    router.afterEach(() => {
      // Скрываем индикатор загрузки
      setTimeout(() => {
        const progressBar = document.querySelector('.page-progress-bar') as HTMLElement;
        if (progressBar) {
          progressBar.classList.remove('loading');
        }

        document.body.classList.remove('page-transitioning');

        // Инициализируем плавные переходы для новой страницы
        initSmoothTransitions();
      }, 100);
    });

    // Инициализация при загрузке
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initSmoothTransitions);
    } else {
      initSmoothTransitions();
    }

    console.log('✨ Плавные переходы активированы!');
  }
});