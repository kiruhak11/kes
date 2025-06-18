// server/api/contact.post.ts
import { readBody, createError, defineEventHandler } from "h3";
import { useRuntimeConfig } from "#imports";
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

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

    // Получаем клиент Supabase
    const client = await serverSupabaseClient<Database>(event);

    // Сохраняем заявку в базу данных
    const requestData: Database['public']['Tables']['requests']['Insert'] = {
      type: body.text.includes('🛒') ? 'order' : 'contact',
      phone: body.text.match(/Телефон: (.*?)(?:\n|$)/)?.[1] || '',
      region: body.text.match(/Регион: (.*?)(?:\n|$)/)?.[1] || '',
      type_building: body.text.match(/Тип здания: (.*?)(?:\n|$)/)?.[1] || '',
      fuel_type: body.text.match(/Вид топлива: (.*?)(?:\n|$)/)?.[1] || '',
      power_type: body.text.match(/Тип мощности: (.*?)(?:\n|$)/)?.[1] || '',
      raw_text: body.text,
      status: 'new'
    }

    const { error: dbError } = await client
      .from('requests')
      .insert([requestData])

    if (dbError) {
      console.error('Error saving request to database:', {
        error: dbError,
        requestData: { ...requestData, raw_text: '[REDACTED]' }
      });
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${dbError.message}`
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
  } catch (error: any) {
    // Log any unhandled errors
    console.error('Unhandled error in contact API:', error);
    throw error;
  }
});
