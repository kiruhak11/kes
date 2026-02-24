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

    // Получаем категории с их порядком
    const [cat1, cat2] = await Promise.all([
      prisma.categories.findUnique({
        where: { id: categoryId1 },
        select: { id: true, display_order: true },
      }),
      prisma.categories.findUnique({
        where: { id: categoryId2 },
        select: { id: true, display_order: true },
      }),
    ]);

    if (!cat1 || !cat2) {
      throw createError({
        statusCode: 404,
        statusMessage: "One or both categories not found",
      });
    }

    // Меняем порядок местами в одной транзакции
    await prisma.$transaction([
      prisma.categories.update({
        where: { id: cat1.id },
        data: { display_order: cat2.display_order },
      }),
      prisma.categories.update({
        where: { id: cat2.id },
        data: { display_order: cat1.display_order },
      }),
    ]);

    return { success: true };
  } catch (error: any) {
    console.error("Error swapping category order:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to swap category order",
    });
  }
});
