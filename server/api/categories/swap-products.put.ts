import { defineEventHandler, createError, readBody } from "h3";
import prisma from "~/server/utils/prisma";
import { requireAdmin } from "~/server/utils/adminAuth";

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event);
    const body = await readBody(event);
    const { categoryId1, categoryId2 } = body;

    if (!categoryId1 || !categoryId2) {
      throw createError({
        statusCode: 400,
        statusMessage: "Both category IDs are required",
      });
    }

    // Получаем категории для проверки их существования
    const [cat1, cat2] = await Promise.all([
      prisma.categories.findUnique({
        where: { id: categoryId1 },
        include: { products: true },
      }),
      prisma.categories.findUnique({
        where: { id: categoryId2 },
        include: { products: true },
      }),
    ]);

    if (!cat1 || !cat2) {
      throw createError({
        statusCode: 404,
        statusMessage: "One or both categories not found",
      });
    }

    // Обновляем только связи продуктов с категориями
    await prisma.$transaction([
      // Обновляем продукты первой категории
      prisma.products.updateMany({
        where: { category_id: categoryId1 },
        data: {
          category_id: categoryId2,
          category_name: cat2.name,
          category_slug: cat2.slug,
        },
      }),
      // Обновляем продукты второй категории
      prisma.products.updateMany({
        where: { category_id: categoryId2 },
        data: {
          category_id: categoryId1,
          category_name: cat1.name,
          category_slug: cat1.slug,
        },
      }),
    ]);

    return { success: true };
  } catch (error: any) {
    console.error("Error swapping category products:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to swap category products",
    });
  }
});
