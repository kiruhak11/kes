// server/api/contact.post.ts
import { readBody, createError, defineEventHandler } from "h3";
import { useRuntimeConfig } from "#imports";
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const { telegramBotToken, telegramChatId } = config.public;

    // Validate environment variables
    if (!telegramBotToken || !telegramChatId) {
      console.error('Missing Telegram configuration:', { 
        hasTelegramToken: !!telegramBotToken, 
        hasChatId: !!telegramChatId 
      });
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error: Missing Telegram credentials'
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
    const requestData = {
      type: body.text.includes('🛒') ? 'order' : 'contact',
      phone: body.text.match(/Телефон: (.*?)(?:\n|$)/)?.[1] || '',
      region: body.text.match(/Регион: (.*?)(?:\n|$)/)?.[1] || '',
      type_building: body.text.match(/Тип здания: (.*?)(?:\n|$)/)?.[1] || '',
      fuel_type: body.text.match(/Вид топлива: (.*?)(?:\n|$)/)?.[1] || '',
      power_type: body.text.match(/Тип мощности: (.*?)(?:\n|$)/)?.[1] || '',
      raw_text: body.text,
      status: 'new'
    }
    await prisma.requests.create({ data: requestData })

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
      console.error("Telegram API error:", {
        error: err,
        url: url.replace(telegramBotToken, '[REDACTED]'),
        params: { ...params, text: '[REDACTED]' }
      });
      throw createError({
        statusCode: err.statusCode || 502,
        statusMessage: `Telegram API Error: ${err.message}`,
      });
    }
  } catch (e: any) {
    console.error('POST /api/contact error:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
})
