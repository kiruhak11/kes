// server/api/contact.post.ts
import { readBody, createError, defineEventHandler } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    // Validate Telegram configuration
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("Missing Telegram configuration:", {
        hasTelegramToken: !!TELEGRAM_BOT_TOKEN,
        hasChatId: !!TELEGRAM_CHAT_ID,
        telegramBotToken: TELEGRAM_BOT_TOKEN ? "SET" : "NOT_SET",
        telegramChatId: TELEGRAM_CHAT_ID ? "SET" : "NOT_SET",
      });
      throw createError({
        statusCode: 500,
        statusMessage:
          "Server configuration error: Missing Telegram credentials",
      });
    }

    // читаем тело
    const body = await readBody<{ text?: string }>(event);
    if (!body || typeof body.text !== "string" || !body.text.trim()) {
      // если нет поля text — возвращаем понятный 400
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: body.text is required",
      });
    }

    // Сохраняем заявку в базу данных через Prisma
    let dbSuccess = false;
    try {
      const requestData = {
        type: body.text.includes("🛒") ? "order" : "contact",
        phone: body.text.match(/Телефон: (.*?)(?:\n|$)/)?.[1] || "",
        region: body.text.match(/Регион: (.*?)(?:\n|$)/)?.[1] || "",
        type_building: body.text.match(/Тип здания: (.*?)(?:\n|$)/)?.[1] || "",
        fuel_type: body.text.match(/Вид топлива: (.*?)(?:\n|$)/)?.[1] || "",
        power_type: body.text.match(/Тип мощности: (.*?)(?:\n|$)/)?.[1] || "",
        raw_text: body.text,
        status: "new",
      };
      await prisma.requests.create({ data: requestData });
      dbSuccess = true;
      console.log("Request saved to database successfully");
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      // Продолжаем выполнение даже если БД недоступна
    }

    // формируем запрос к Telegram
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const params = {
      chat_id: TELEGRAM_CHAT_ID,
      text: body.text,
      parse_mode: "HTML",
    };

    try {
      console.log("Sending to Telegram:", {
        url: url.replace(TELEGRAM_BOT_TOKEN, "[REDACTED]"),
        chatId: TELEGRAM_CHAT_ID,
        textLength: body.text.length,
      });

      const result = await $fetch(url, {
        method: "POST",
        body: params,
      });

      return {
        ok: true,
        result,
        savedToDb: dbSuccess,
        telegramSent: true,
      };
    } catch (err: any) {
      console.error("Telegram API error:", {
        error: err,
        url: url.replace(TELEGRAM_BOT_TOKEN, "[REDACTED]"),
        params: { ...params, text: "[REDACTED]" },
        statusCode: err.statusCode,
        statusMessage: err.statusMessage,
        message: err.message,
      });

      // Если заявка сохранена в БД, возвращаем частичный успех
      if (dbSuccess) {
        return {
          ok: true,
          message:
            "Request saved to database, but Telegram notification failed",
          savedToDb: true,
          telegramSent: false,
          telegramError: err.message,
        };
      }

      throw createError({
        statusCode: err.statusCode || 502,
        statusMessage: `Telegram API Error: ${err.message}`,
      });
    }
  } catch (e: any) {
    console.error("POST /api/contact error:", e);

    // Если это ошибка валидации, возвращаем 400
    if (e.statusCode === 400) {
      throw e;
    }

    // Для остальных ошибок возвращаем 500
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Internal Server Error",
    });
  }
});
