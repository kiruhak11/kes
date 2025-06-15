import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  typescript: { strict: true },
  css: ["@/assets/styles/global/index.scss"],
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
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    key: process.env.SUPABASE_KEY ?? '',
    redirect: false,

  },
  runtimeConfig: {
    public: {
      
      sb_url: process.env.SUPABASE_URL ?? '',
      sb_key: process.env.SUPABASE_KEY ?? '',
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
      telegramChatId: process.env.TELEGRAM_CHAT_ID,
      adminPassword: process.env.ADMIN_PASSWORD,
    },
  },
  modules: ['@nuxtjs/device', '@nuxtjs/supabase'],
  device: {
    // опционально: можно обновлять при ресайзе
    refreshOnResize: true
  },
  nitro: {
    routeRules: {
      '/api/products': { 
        cache: {
          maxAge: 60 * 5 // 5 minutes
        }
      },
      '/api/products/**': { 
        cache: {
          maxAge: 60 * 5 // 5 minutes
        }
      },
      '/api/categories': { 
        cache: {
          maxAge: 60 * 30 // 30 minutes
        }
      }
    }
  }
});