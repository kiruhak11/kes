export default defineNuxtPlugin(() => {
  if (process.client && 'serviceWorker' in navigator) {
    // Регистрируем Service Worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('Service Worker registered:', registration);

        // Обновляем SW при доступности новой версии
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Новая версия доступна
                console.log('New Service Worker available');
                
                // Можно показать уведомление пользователю
                if (confirm('Доступна новая версия сайта. Обновить?')) {
                  window.location.reload();
                }
              }
            });
          }
        });

        // Очищаем кэш периодически
        setInterval(() => {
          if (registration.active) {
            registration.active.postMessage({ type: 'CLEAN_CACHE' });
          }
        }, 24 * 60 * 60 * 1000); // Каждые 24 часа

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    // Регистрируем SW после загрузки страницы
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
    }

    // Обработка offline/online состояний
    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        document.documentElement.classList.remove('offline');
        document.documentElement.classList.add('online');
      } else {
        document.documentElement.classList.remove('online');
        document.documentElement.classList.add('offline');
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Инициализируем статус
    handleOnlineStatus();
  }
});