export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { phone, userAgent, ip, page } = body;

    // Конфигурация Telegram бота
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error("Telegram bot configuration missing");
      return { success: false, error: "Bot not configured" };
    }

    // Формируем сообщение
    const message = `🔔 Новый посетитель на сайте!

📱 Телефон: ${phone || "Не указан"}
🌐 Страница: ${page || "Главная"}
📱 Устройство: ${userAgent || "Не определено"}
🌍 IP: ${ip || "Не определен"}

⏰ Время: ${new Date().toLocaleString("ru-RU")}`;

    // Отправляем сообщение в Telegram
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await $fetch(telegramUrl, {
      method: "POST",
      body: {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
      },
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("Telegram notification error:", error);
    return { success: false, error: "Failed to send notification" };
  }
});
