import { defineEventHandler, readMultipartFormData, createError } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Увеличиваем таймаут для события
    if (event.node.res) {
      event.node.res.setTimeout(600000); // 10 минут
    }

    // Читаем загруженный файл
    const formData = await readMultipartFormData(event);
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: "Файл не был загружен",
      });
    }

    // Находим файл бекапа
    const fileData = formData.find((item) => item.name === "backup");
    
    if (!fileData || !fileData.data) {
      throw createError({
        statusCode: 400,
        message: "Файл бекапа не найден",
      });
    }

    // Проверяем расширение файла
    const filename = fileData.filename || "";
    if (!filename.endsWith(".sql")) {
      throw createError({
        statusCode: 400,
        message: "Неверный формат файла. Требуется .sql файл",
      });
    }

    // Конвертируем буфер в строку
    const sqlContent = fileData.data.toString("utf-8");

    // Проверяем что файл не пустой
    if (!sqlContent || sqlContent.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: "Файл бекапа пустой",
      });
    }

    // Разбиваем SQL на отдельные команды
    // Убираем комментарии и пустые строки
    const sqlStatements = sqlContent
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        return (
          trimmed.length > 0 &&
          !trimmed.startsWith("--") &&
          !trimmed.startsWith("/*")
        );
      })
      .join("\n")
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    if (sqlStatements.length === 0) {
      throw createError({
        statusCode: 400,
        message: "Файл бекапа не содержит валидных SQL команд",
      });
    }

    console.log(`Начинаем восстановление из ${sqlStatements.length} команд...`);

    // Выполняем SQL команды по очереди
    let executedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const statement of sqlStatements) {
      try {
        // Выполняем команду через Prisma
        await prisma.$executeRawUnsafe(statement);
        executedCount++;
        
        // Логируем прогресс каждые 100 команд
        if (executedCount % 100 === 0) {
          console.log(`Выполнено ${executedCount} команд из ${sqlStatements.length}`);
        }
      } catch (error: any) {
        errorCount++;
        const errorMsg = `Ошибка в команде: ${statement.substring(0, 100)}... - ${error.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
        
        // Если слишком много ошибок, прерываем процесс
        if (errorCount > 10) {
          throw createError({
            statusCode: 500,
            message: `Слишком много ошибок при восстановлении (${errorCount}). Первые ошибки: ${errors.slice(0, 5).join("; ")}`,
          });
        }
      }
    }

    console.log(`Восстановление завершено. Выполнено: ${executedCount}, Ошибок: ${errorCount}`);

    return {
      success: true,
      message: `База данных успешно восстановлена из бекапа`,
      details: {
        totalStatements: sqlStatements.length,
        executedCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  } catch (error: any) {
    console.error("Ошибка при восстановлении бекапа:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Ошибка при восстановлении базы данных из бекапа",
    });
  }
});

