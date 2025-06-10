// server/api/contact.post.ts
import { readBody, createError, sendError, defineEventHandler } from "h3";
import { useRuntimeConfig } from "#imports";

export default defineEventHandler(async (event) => {
  const { telegramBotToken, telegramChatId } = useRuntimeConfig().public;

  // читаем тело
  const body = await readBody<{ text?: string }>(event);
  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    // если нет поля text — возвращаем понятный 400
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: body.text is required",
    });
  }

  // формируем запрос к Telegram
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  const params = {
    chat_id: telegramChatId,
    text: body.text,
    parse_mode: "HTML",
  };

  try {
    const result = await $fetch(url, {
      method: "POST",
      body: params,
    });
    return { ok: true, result };
  } catch (err: any) {
    console.error("Telegram API error:", err);
    // пробрасываем ошибку дальше, чтобы Nuxt вернул 502 или 500
    throw createError({
      statusCode: err.statusCode || 502,
      statusMessage: `Telegram API Error: ${err.message}`,
    });
  }
});
