import { defineEventHandler, readMultipartFormData, createError } from "h3";
import { writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "~/server/utils/adminAuth";

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event);

    const files = await readMultipartFormData(event);
    if (!files || files.length === 0) {
      throw createError({
        statusCode: 400,
        message: "No file uploaded",
      });
    }

    const file = files[0];
    if (!file.type?.startsWith("image/")) {
      throw createError({
        statusCode: 400,
        message: "File must be an image",
      });
    }
    if (file.data.length > 10 * 1024 * 1024) {
      throw createError({
        statusCode: 413,
        message: "Image too large. Max size is 10MB",
      });
    }

    // Создаем директорию для загрузок, если её нет
    const uploadDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error("Error creating upload directory:", error);
    }

    // Генерируем уникальное имя файла
    const safeOriginalName = basename(file.filename || "image");
    const extension = safeOriginalName.split(".").pop()?.toLowerCase() || "jpg";
    const allowedExt = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg"]);
    if (!allowedExt.has(extension)) {
      throw createError({
        statusCode: 400,
        message: "Unsupported image extension",
      });
    }
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const filePath = join(uploadDir, fileName);

    // Сохраняем файл
    await writeFile(filePath, file.data);

    // Возвращаем путь к файлу относительно public директории
    return {
      path: `/uploads/${fileName}`,
    };
  } catch (error: any) {
    console.error("Error uploading file:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Error uploading file",
    });
  }
});
