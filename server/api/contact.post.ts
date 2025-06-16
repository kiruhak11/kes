// server/api/contact.post.ts
import { readBody, createError, sendError, defineEventHandler } from "h3";
import { useRuntimeConfig } from "#imports";
import { supabase } from '~/server/utils/supabase'

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

  // Сохраняем заявку в базу данных
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

  const { error: dbError } = await supabase
    .from('requests')
    .insert([requestData])

  if (dbError) {
    console.error('Error saving request to database:', dbError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save request to database'
    })
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
