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
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false,
    redirectOptions: {
      login: "/auth/login",
      callback: "/confirm",
      exclude: ["/*"],
    },
  },
  runtimeConfig: {
    public: {
      supabaseUrl:
        process.env.SUPABASE_URL || "https://your-project.supabase.co",
      supabaseKey: process.env.SUPABASE_KEY || "your-anon-key",
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
      telegramChatId: process.env.TELEGRAM_CHAT_ID,
      adminPassword: process.env.ADMIN_PASSWORD || "admin",
    },
  },
  modules: [
    "@nuxtjs/device",
    "@nuxtjs/supabase",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "rubillex_frog-modal",
    "nuxt-file-storage",
  ],
  piniaPluginPersistedstate: {
    storage: "localStorage",
  },
  fileStorage: {
    // Используем переменную окружения для пути к хранилищу файлов
    mount: process.env.FILE_STORAGE_MOUNT || "./public/uploads",
  },
});
