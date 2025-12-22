import { defineEventHandler, setHeader, createError } from "h3";
import prisma from "~/server/utils/prisma";
import type {
  categories as Category,
  products as Product,
  visits as Visit,
  requests as Request,
} from "@prisma/client";

// Константы для пагинации
const BATCH_SIZE = 100;

export default defineEventHandler(async (event) => {
  try {
    // Увеличиваем таймаут для события
    if (event.node.res) {
      event.node.res.setTimeout(300000); // 5 минут
    }

    let sqlContent =
      "-- Backup created at " + new Date().toISOString() + "\n\n";

    // Устанавливаем кодировку
    sqlContent += "-- Устанавливаем кодировку UTF-8\n";
    sqlContent += "SET NAMES utf8mb4;\n";
    sqlContent += "SET CHARACTER SET utf8mb4;\n\n";

    // Указываем базу данных
    sqlContent += "-- Используем базу данных\n";
    sqlContent += "USE `kes-site`;\n\n";

    // Очистка таблиц
    sqlContent += "-- Очистка существующих данных\n";
    sqlContent += "SET FOREIGN_KEY_CHECKS=0;\n";
    sqlContent += "DELETE FROM `requests`;\n";
    sqlContent += "DELETE FROM `visits`;\n";
    sqlContent += "DELETE FROM `products`;\n";
    sqlContent += "DELETE FROM `categories`;\n";
    sqlContent += "SET FOREIGN_KEY_CHECKS=1;\n\n";

    // Функция для пакетной обработки данных
    async function* batchProcessor<T>(
      fetcher: (skip: number, take: number) => Promise<T[]>,
      counter: () => Promise<number>
    ) {
      const total = await counter();
      for (let skip = 0; skip < total; skip += BATCH_SIZE) {
        const batch = await fetcher(skip, BATCH_SIZE);
        yield batch;
      }
    }

    // Обработка категорий
    sqlContent += "-- Восстановление категорий\n";
    for await (const categories of batchProcessor(
      (skip, take) => prisma.categories.findMany({ skip, take }),
      () => prisma.categories.count()
    )) {
      for (const category of categories) {
        const values = [
          `'${escapeSqlString(category.id)}'`,
          `'${escapeSqlString(category.name)}'`,
          category.description
            ? `'${escapeSqlString(category.description)}'`
            : "NULL",
          `'${escapeSqlString(category.slug)}'`,
          category.display_order || 1,
        ].join(", ");

        sqlContent += `INSERT INTO categories (id, name, description, slug, display_order) VALUES (${values});\n`;
      }
    }
    sqlContent += "\n";

    // Обработка продуктов
    sqlContent += "-- Восстановление продуктов\n";
    for await (const products of batchProcessor(
      (skip, take) => prisma.products.findMany({ skip, take }),
      () => prisma.products.count()
    )) {
      for (const product of products) {
        const values = [
          product.id,
          `'${escapeSqlString(product.name || "")}'`,
          `'${escapeSqlString(product.description || "")}'`,
          `'${escapeSqlString(product.extendedDescription || "")}'`,
          product.price || 0,
          `'${escapeSqlString(product.image || "")}'`,
          product.category_id
            ? `'${escapeSqlString(product.category_id)}'`
            : "NULL",
          `'${escapeSqlJson(product.specs || [])}'`,
          product.additional_images
            ? `'${escapeSqlJson(product.additional_images)}'`
            : "NULL",
          product.delivery_set
            ? `'${escapeSqlString(product.delivery_set)}'`
            : "NULL",
          product.connection_scheme
            ? `'${escapeSqlString(product.connection_scheme)}'`
            : "NULL",
          product.additional_requirements
            ? `'${escapeSqlString(product.additional_requirements)}'`
            : "NULL",
          product.required_products
            ? `'${escapeSqlJson(product.required_products)}'`
            : "NULL",
        ].join(", ");

        sqlContent += `INSERT INTO products (id, name, description, extendedDescription, price, image, category_id, specs, additional_images, delivery_set, connection_scheme, additional_requirements, required_products) VALUES (${values});\n`;
      }
    }
    sqlContent += "\n";

    // Обработка посещений
    sqlContent += "-- Восстановление данных о посещениях\n";
    for await (const visits of batchProcessor(
      (skip, take) => prisma.visits.findMany({ skip, take }),
      () => prisma.visits.count()
    )) {
      for (const visit of visits) {
        // Форматируем дату в MySQL DATE формат (YYYY-MM-DD)
        const dateStr = visit.date.toISOString().split('T')[0];
        const values = [
          visit.id,
          `'${dateStr}'`,
          visit.count,
        ].join(", ");

        sqlContent += `INSERT INTO visits (id, date, count) VALUES (${values});\n`;
      }
    }
    sqlContent += "\n";

    // Обработка заявок
    sqlContent += "-- Восстановление заявок\n";
    for await (const requests of batchProcessor(
      (skip, take) => prisma.requests.findMany({ skip, take }),
      () => prisma.requests.count()
    )) {
      for (const request of requests) {
        const values = [
          request.id,
          `'${escapeSqlString(request.type)}'`,
          `'${escapeSqlString(request.phone)}'`,
          request.region ? `'${escapeSqlString(request.region)}'` : "NULL",
          request.type_building
            ? `'${escapeSqlString(request.type_building)}'`
            : "NULL",
          request.fuel_type
            ? `'${escapeSqlString(request.fuel_type)}'`
            : "NULL",
          request.power_type
            ? `'${escapeSqlString(request.power_type)}'`
            : "NULL",
          `'${escapeSqlString(request.status)}'`,
          request.raw_text ? `'${escapeSqlString(request.raw_text)}'` : "NULL",
          `'${toMySQLDateTime(request.created_at)}'`,
        ].join(", ");

        sqlContent += `INSERT INTO requests (id, type, phone, region, type_building, fuel_type, power_type, status, raw_text, created_at) VALUES (${values});\n`;
      }
    }
    sqlContent += "\n";

    // Добавляем команду для сброса автоинкремента
    sqlContent += "-- Сброс автоинкремента\n";
    sqlContent += "ALTER TABLE categories AUTO_INCREMENT = 1;\n";
    sqlContent += "ALTER TABLE products AUTO_INCREMENT = 1;\n";
    sqlContent += "ALTER TABLE visits AUTO_INCREMENT = 1;\n";
    sqlContent += "ALTER TABLE requests AUTO_INCREMENT = 1;\n";

    // Генерируем имя файла с текущей датой
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.sql`;

    // Устанавливаем заголовки для скачивания
    setHeader(event, "Content-Type", "application/sql");
    setHeader(
      event,
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    // Возвращаем SQL контент
    return sqlContent;
  } catch (error: any) {
    console.error("Ошибка при создании бэкапа:", error);
    throw createError({
      statusCode: 500,
      message: `Ошибка при создании бэкапа: ${error.message}`,
    });
  }
});

// Функция для экранирования строк в SQL
function escapeSqlString(str: string | null): string {
  if (!str) return "";
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case '"':
      case "'":
      case "\\":
      case "%":
        return "\\" + char;
    }
    return char;
  });
}

// Функция для экранирования JSON в SQL
// JSON.stringify уже экранирует всё нужное, нам нужно только экранировать одинарные кавычки и слэши для SQL
function escapeSqlJson(obj: any): string {
  if (!obj) return "NULL";
  const jsonStr = JSON.stringify(obj);
  // Экранируем только одинарные кавычки и обратные слэши для SQL
  return jsonStr.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// Функция для конвертации Date в MySQL DATETIME формат
function toMySQLDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}
