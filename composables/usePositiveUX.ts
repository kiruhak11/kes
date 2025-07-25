export const usePositiveUX = () => {
  // Позитивные сообщения для разных состояний
  const positiveMessages = {
    loading: [
      '✨ Подготавливаем для вас лучшие товары...',
      '🚀 Загружаем актуальную информацию...',
      '💫 Совсем скоро всё будет готово...',
      '🎯 Ищем идеальные решения для вас...',
      '⚡ Обновляем данные до последней версии...',
    ],
    success: [
      '🎉 Отлично! Всё готово!',
      '✅ Успешно загружено!',
      '🌟 Данные обновлены!',
      '🎊 Готово к просмотру!',
    ],
    error: [
      '😔 Что-то пошло не так, но мы это исправим!',
      '🔧 Временные технические работы...',
      '⚡ Попробуйте обновить страницу',
      '🛠️ Мы уже работаем над решением!',
    ],
    empty: [
      '🔍 Здесь пока пусто, но скоро появится что-то интересное!',
      '📦 Товары в пути! Загляните позже',
      '🌱 Раздел развивается, следите за обновлениями',
    ],
  };

  // Получить случайное позитивное сообщение
  const getPositiveMessage = (type: keyof typeof positiveMessages) => {
    const messages = positiveMessages[type];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Показать уведомление с позитивным сообщением
  const showPositiveNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    if (process.client) {
      // Создаем красивое уведомление
      const notification = document.createElement('div');
      notification.className = `positive-notification ${type}`;
      notification.innerHTML = `
        <div class="notification-content">
          <span class="notification-message">${message}</span>
          <button class="notification-close">&times;</button>
        </div>
      `;

      // Добавляем стили
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 350px;
        font-size: 0.9rem;
        line-height: 1.4;
      `;

      if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      } else if (type === 'warning') {
        notification.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      }

      document.body.appendChild(notification);

      // Анимация появления
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);

      // Обработчик закрытия
      const closeBtn = notification.querySelector('.notification-close');
      const closeNotification = () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 400);
      };

      closeBtn?.addEventListener('click', closeNotification);

      // Автоматическое закрытие через 5 секунд
      setTimeout(closeNotification, 5000);
    }
  };

  // Анимация успешного действия
  const celebrateSuccess = (element?: HTMLElement) => {
    if (process.client) {
      // Создаем конфетти эффект
      const colors = ['#e31e24', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
      
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          const confetti = document.createElement('div');
          confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: ${element ? element.getBoundingClientRect().top : 50}px;
            left: ${element ? element.getBoundingClientRect().left : window.innerWidth / 2}px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: confettiFall 2s ease-out forwards;
          `;

          document.body.appendChild(confetti);

          setTimeout(() => {
            if (confetti.parentNode) {
              confetti.parentNode.removeChild(confetti);
            }
          }, 2000);
        }, i * 50);
      }

      // Добавляем CSS анимацию если её нет
      if (!document.querySelector('#confetti-styles')) {
        const style = document.createElement('style');
        style.id = 'confetti-styles';
        style.textContent = `
          @keyframes confettiFall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(200px) rotate(360deg);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }
    }
  };

  // Плавное появление элементов списка
  const animateListItems = (container: HTMLElement, delay = 100) => {
    if (process.client) {
      const items = container.querySelectorAll('.list-item, .product-card, .category-card');
      items.forEach((item, index) => {
        const element = item as HTMLElement;
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, index * delay);
      });
    }
  };

  return {
    getPositiveMessage,
    showPositiveNotification,
    celebrateSuccess,
    animateListItems,
  };
};