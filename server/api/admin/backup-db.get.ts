import { defineEventHandler, setHeader } from "h3";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export default defineEventHandler(async (event) => {
  try {
    // Создаем временную директорию для бэкапа, если её нет
    const backupDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Генерируем имя файла с текущей датой
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.sql`;
    const backupPath = path.join(backupDir, filename);

    // Получаем URL базы данных из переменной окружения или конфига Prisma
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL не настроен");
    }

    // Парсим URL для получения параметров подключения
    const url = new URL(databaseUrl);
    const database = url.pathname.slice(1);
    const username = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = url.port;

    // Формируем команду для создания дампа
    const command = `pg_dump -h ${host} -p ${port} -U ${username} -F p ${database} > "${backupPath}"`;

    // Устанавливаем переменную окружения с паролем для pg_dump
    const env = { ...process.env, PGPASSWORD: password };

    // Выполняем команду
    await execAsync(command, { env });

    // Читаем файл бэкапа
    const backupContent = fs.readFileSync(backupPath);

    // Удаляем временный файл
    fs.unlinkSync(backupPath);

    // Устанавливаем заголовки для скачивания
    setHeader(event, "Content-Type", "application/sql");
    setHeader(
      event,
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    // Возвращаем содержимое файла
    return backupContent;
  } catch (error: any) {
    console.error("Ошибка при создании бэкапа:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Ошибка при создании бэкапа: ${error.message}`,
    });
  }
});
