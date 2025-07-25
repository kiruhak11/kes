export default defineNuxtPlugin(() => {
  if (process.client) {
    // Оптимизированная загрузка шрифтов
    const loadFonts = () => {
      // Проверяем, поддерживает ли браузер font-display
      const supportsFontDisplay = 'fontDisplay' in document.documentElement.style;
      
      // Создаем link для шрифтов с оптимальными параметрами
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
      
      // Добавляем атрибуты для оптимизации
      fontLink.crossOrigin = 'anonymous';
      
      if (supportsFontDisplay) {
        fontLink.media = 'print';
        fontLink.onload = () => {
          fontLink.media = 'all';
        };
      }

      document.head.appendChild(fontLink);

      // Предзагружаем критические шрифты
      const preloadFont = (url: string, format: string = 'woff2') => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = `font/${format}`;
        link.href = url;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      };

      // Предзагружаем основные веса шрифтов
      preloadFont('https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2');
      preloadFont('https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2');
    };

    // Оптимизация загрузки шрифтов
    const optimizeFontLoading = () => {
      // Используем font-display: swap для всех шрифтов
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'Roboto';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url(https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2) format('woff2');
        }
        @font-face {
          font-family: 'Roboto';
          font-style: normal;
          font-weight: 500;
          font-display: swap;
          src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2) format('woff2');
        }
        @font-face {
          font-family: 'Roboto';
          font-style: normal;
          font-weight: 700;
          font-display: swap;
          src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2) format('woff2');
        }
      `;
      document.head.appendChild(style);
    };

    // Проверяем, загружены ли шрифты
    const checkFontLoad = () => {
      if ('fonts' in document) {
        document.fonts.ready.then(() => {
          document.documentElement.classList.add('fonts-loaded');
        });

        // Таймаут для медленных соединений
        setTimeout(() => {
          document.documentElement.classList.add('fonts-loaded');
        }, 3000);
      } else {
        // Fallback для старых браузеров
        setTimeout(() => {
          document.documentElement.classList.add('fonts-loaded');
        }, 1000);
      }
    };

    // Инициализация
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        loadFonts();
        optimizeFontLoading();
        checkFontLoad();
      });
    } else {
      loadFonts();
      optimizeFontLoading();
      checkFontLoad();
    }
  }
});