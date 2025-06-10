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
  runtimeConfig: {
    public: {
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
      telegramChatId: process.env.TELEGRAM_CHAT_ID,
      adminPassword: process.env.ADMIN_PASSWORD,
    },
  },
});
