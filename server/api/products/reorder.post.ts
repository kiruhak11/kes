import { defineEventHandler, createError, readBody } from "h3";
import prisma from "~/server/utils/prisma";
import { requireAdmin } from "~/server/utils/adminAuth";

interface ReorderPayload {
  productId: number;
  targetId: number;
}

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event);

    if (process.env.ALLOW_PRODUCT_ID_REORDER !== "true") {
      throw createError({
        statusCode: 409,
        statusMessage:
          "Unsafe product reorder is disabled. Set ALLOW_PRODUCT_ID_REORDER=true to enable temporarily.",
      });
    }

    const { productId, targetId } = await readBody<ReorderPayload>(event);

    // Получаем оба товара
    const [product, targetProduct] = await Promise.all([
      prisma.products.findUnique({ where: { id: productId } }),
      prisma.products.findUnique({ where: { id: targetId } }),
    ]);

    if (!product || !targetProduct) {
      throw createError({
        statusCode: 404,
        message: "One or both products not found",
      });
    }

    // Меняем ID местами через временный ID
    const tempId = -productId; // Используем отрицательное значение для уникальности

    // Обновляем в три шага для избежания конфликтов уникальности
    await prisma.$transaction([
      // 1. Перемещаем первый товар на временный ID
      prisma.products.update({
        where: { id: productId },
        data: { id: tempId },
      }),
      // 2. Перемещаем второй товар на ID первого
      prisma.products.update({
        where: { id: targetId },
        data: { id: productId },
      }),
      // 3. Перемещаем первый товар с временного ID на ID второго
      prisma.products.update({
        where: { id: tempId },
        data: { id: targetId },
      }),
    ]);

    return { success: true };
  } catch (e: any) {
    console.error("POST /api/products/reorder error:", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Internal Server Error",
    });
  }
});
