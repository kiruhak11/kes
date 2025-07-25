export default defineNuxtPlugin(() => {
  if (process.client) {
    // Инжектим критический CSS для мгновенного рендеринга
    const injectCriticalCSS = () => {
      const critical = `
        /* Минимальные критические стили - только для предотвращения FOUC */
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        /* Предотвращаем мигание при загрузке */
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }
      `;

      // Проверяем, не добавлен ли уже критический CSS
      if (!document.querySelector('[data-critical-css]')) {
        const style = document.createElement('style');
        style.textContent = critical;
        style.setAttribute('data-critical-css', 'true');
        document.head.insertBefore(style, document.head.firstChild);
      }
    };

    // Инжектим критический CSS немедленно
    injectCriticalCSS();
    
    // Показываем некритичные элементы после загрузки основных стилей
    setTimeout(() => {
      document.querySelectorAll('.non-critical').forEach((el) => {
        el.classList.add('loaded');
      });
    }, 100);
  }
});