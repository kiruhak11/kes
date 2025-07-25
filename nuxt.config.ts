import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  typescript: { strict: true },

  // Экспериментальные функции для производительности
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    componentIslands: true,
    treeshakeClientOnly: true,
    asyncContext: true,
    crossOriginPrefetch: true,
    inlineRouteRules: true,
    viewTransition: true,
    headNext: true,
    typedPages: true,
  },

  // Оптимизация рендеринга - критично для скорости!
  ssr: true,
  routeRules: {
    // Главная страница - предрендер для мгновенной загрузки
    '/': { prerender: true, headers: { 'cache-control': 's-maxage=31536000' } },
    // Каталог - ISR с кэшированием
    '/catalog': { isr: 60, headers: { 'cache-control': 's-maxage=3600' } },
    '/catalog/**': { isr: 300, headers: { 'cache-control': 's-maxage=7200' } },
    // API - кэширование
    '/api/**': { cors: true, headers: { 'cache-control': 's-maxage=300' } },
    // Статические страницы
    '/about': { prerender: true },
    '/contact': { prerender: true },
  },

  // Оптимизация рендеринга
  nitro: {
    compressPublicAssets: true,
    minify: true,
    prerender: {
      routes: [],
      crawlLinks: false,
      ignore: ["/api/**"],
    },
    storage: {
      redis: {
        driver: "memory",
      },
    },
  },

  // Оптимизация Vite - максимальная производительность
  vite: {
    build: {
      target: "esnext",
      minify: "esbuild",
      cssMinify: "esbuild",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Умное разделение чанков для оптимальной загрузки
            if (id.includes('node_modules')) {
              if (id.includes('vue')) return 'vue-vendor';
              if (id.includes('chart.js')) return 'charts';
              if (id.includes('@nuxt')) return 'nuxt-vendor';
              return 'vendor';
            }
            if (id.includes('pages/')) return 'pages';
            if (id.includes('components/')) return 'components';
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // перед каждым scss-файлом (включая <style> в компонентах)
          // будут автоматически подключаться эти модули
          additionalData: `
            @use "@/assets/styles/collection/functions" as *;
            @use "@/assets/styles/collection/colors" as *;
            @use "@/assets/styles/collection/fonts" as *;
          `,
        },
      },
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "chart.js", "@vueuse/core"],
      exclude: ["@nuxt/devtools"],
    },
    ssr: {
      noExternal: ["@nuxt/image", "@vueuse/core"],
    },
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },
  },

  // Оптимизация изображений - максимальная производительность
  image: {
    domains: ["kes-sib.ru"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    format: ["avif", "webp", "jpg"],
    quality: 85,
    densities: [1, 2],
    provider: "ipx",
    presets: {
      avatar: {
        modifiers: {
          format: "webp",
          width: 50,
          height: 50,
          quality: 90,
        },
      },
      thumbnail: {
        modifiers: {
          format: "webp",
          width: 300,
          height: 200,
          quality: 80,
        },
      },
      hero: {
        modifiers: {
          format: "webp",
          width: 1200,
          height: 600,
          quality: 85,
        },
      },
    },
    // Ленивая загрузка по умолчанию
    loading: "lazy",
    // Предзагрузка критических изображений
    preload: {
      sizes: "100vw",
    },
  },

  // Оптимизация CSS
  css: [
    "@/assets/styles/global/index.scss",
    "@/assets/styles/animations.scss"
  ],

  // Runtime конфигурация
  runtimeConfig: {
    public: {
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
      telegramChatId: process.env.TELEGRAM_CHAT_ID,
      adminPassword: process.env.ADMIN_PASSWORD || "admin",
    },
  },

  // Модули
  modules: [
    "@nuxtjs/device",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "rubillex_frog-modal",
    "nuxt-file-storage",
    "@nuxt/image",
    [
      "@nuxtjs/sitemap",
      {
        siteUrl: "https://kes-sib.ru",
        xsl: false,
        defaults: {
          changefreq: "weekly",
          priority: 0.7,
        },
        // Можно добавить фильтрацию/исключения при необходимости
      },
    ],
  ],

  // Pinia конфигурация
  piniaPluginPersistedstate: {
    storage: "localStorage",
  },

  // File storage конфигурация
  fileStorage: {
    // Используем переменную окружения для пути к хранилищу файлов
    mount: process.env.FILE_STORAGE_MOUNT || "./public/uploads",
  },

  // Оптимизация загрузки - критические ресурсы
  app: {
    head: {
      htmlAttrs: {
        lang: 'ru',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "dns-prefetch",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "dns-prefetch",
          href: "https://fonts.gstatic.com",
        },
      ],
    },
    // Оптимизация загрузки страниц
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  // Оптимизация сборки
  build: {
    transpile: ['chart.js'],
  },

  // Оптимизация devtools
  devtools: { enabled: process.env.NODE_ENV === 'development' },

  // Дополнительные оптимизации производительности
  features: {
    // Отключаем неиспользуемые функции для ускорения
    inlineStyles: false, // Используем наш критический CSS
    noScripts: false,
  },

  // Оптимизация сборки
  optimization: {
    keyedComposables: [
      {
        name: 'useState',
        argumentLength: 2,
      },
    ],
  },

  // Хуки для дополнительных оптимизаций
  hooks: {
    'build:before': () => {
      console.log('🚀 Запуск оптимизированной сборки...');
    },
    'nitro:build:before': (nitro) => {
      // Дополнительные оптимизации Nitro
      nitro.options.minify = true;
      nitro.options.sourceMap = false;
    },
  },
});
