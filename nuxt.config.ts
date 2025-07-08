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
  },

  // Оптимизация рендеринга
  nitro: {
    compressPublicAssets: true,
    minify: true,
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
    storage: {
      redis: {
        driver: 'memory',
      },
    },
  },

  // Оптимизация Vite
  vite: {
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            ui: ['@nuxt/image'],
            charts: ['chart.js'],
          },
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
      include: ['vue', 'vue-router', '@nuxt/image', 'chart.js'],
    },
  },

  // Оптимизация изображений
  image: {
    screens: {
      default: 320,
      xxs: 480,
      md: 996,
      lg: 1280,
      sm: 640,
    },
    format: ['webp'],
    quality: 80,
    provider: 'ipx',
    presets: {
      avatar: {
        modifiers: {
          format: 'webp',
          width: 50,
          height: 50,
        },
      },
    },
  },

  // Оптимизация CSS
  css: ["@/assets/styles/global/index.scss"],

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
    ["@nuxtjs/sitemap", {
      siteUrl: 'https://kes-sib.ru',
      xsl: false,
      defaults: {
        changefreq: 'weekly',
        priority: 0.7,
      },
    }],
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

  // Оптимизация загрузки
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
      ],
    },
  },

  // Оптимизация devtools
  devtools: { enabled: false },
});