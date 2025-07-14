import { defineEventHandler, readMultipartFormData, createError } from "h3";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";

export default defineEventHandler(async (event) => {
  try {
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

    // Создаем директорию для загрузок, если её нет
    const uploadDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error("Error creating upload directory:", error);
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const originalName = file.filename || "image";
    const extension = originalName.split(".").pop() || "jpg";
    const fileName = `${timestamp}-${originalName}`;
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
