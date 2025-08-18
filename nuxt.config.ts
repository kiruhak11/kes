import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  typescript: { strict: true },

  // Минимальные экспериментальные функции
  experimental: {
    payloadExtraction: false,
  },

  // Стандартный SSR без агрессивного кэширования
  ssr: true,

  // Простая конфигурация Nitro
  nitro: {
    compressPublicAssets: true,
  },

  // Стандартная конфигурация Vite
  vite: {
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
  },

  // Простая конфигурация изображений
  image: {
    domains: ["kes-sib.ru"],
    format: ["webp"],
    quality: 80,
    provider: "ipx",
  },

  // Основные стили с плавными переходами
  css: [
    "@/assets/styles/global/index.scss",
    "@/assets/styles/smooth-transitions.scss",
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
  pinia: {
    autoImports: ["defineStore", "acceptHMRUpdate"],
  },

  // File storage конфигурация
  fileStorage: {
    // Используем переменную окружения для пути к хранилищу файлов
    mount: process.env.FILE_STORAGE_MOUNT || "./public/uploads",
  },

  // Конфигурация приложения с переходами
  app: {
    head: {
      htmlAttrs: {
        lang: "ru",
      },
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
          href: "https://kes-sib.ru",
        },
        {
          rel: "preconnect",
          href: "https://kes-sib.ru",
        },
      ],
      meta: [
        {
          charset: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          name: "format-detection",
          content: "telephone=no",
        },
        {
          name: "theme-color",
          content: "#e31e24",
        },
        {
          name: "msapplication-TileColor",
          content: "#e31e24",
        },
        {
          name: "apple-mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "default",
        },
        {
          name: "apple-mobile-web-app-title",
          content: "КотлоЭнергоСнаб",
        },
      ],
    },
    // Красивые переходы страниц
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: { name: "layout", mode: "out-in" },
  },

  // Стандартные настройки
  devtools: { enabled: true },
});
