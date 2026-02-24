import { defineEventHandler, createError, readBody } from "h3";
import prisma from "~/server/utils/prisma";
import { requireAdmin } from "~/server/utils/adminAuth";

interface Characteristic {
  id: number;
  key: string;
  value: string;
  show_in_filters?: boolean;
  order?: number;
}

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event);
    const productId = event.context.params?.id;
    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product ID is required",
      });
    }

    const body = await readBody(event);

    // Проверяем и форматируем характеристики
    const specs = Array.isArray(body.specs) ? body.specs : [];

    // Подготавливаем данные для обновления
    const updateData = {
      ...body,
      specs: specs.filter((spec: Characteristic) => spec.key && spec.value), // Удаляем пустые характеристики
    };

    // Обновляем продукт
    const updated = await prisma.products.update({
      where: { id: Number(productId) },
      data: updateData,
      include: {
        categories: true,
      },
    });

    return { success: true, product: updated };
  } catch (e: any) {
    console.error("PUT /api/products/[id] error:", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Internal Server Error",
    });
  }
});
