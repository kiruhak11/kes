import { defineEventHandler, createError, readBody } from "h3";
import prisma from "~/server/utils/prisma";

interface OrderUpdate {
  id: string;
  display_order: number;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { updates } = body as { updates: OrderUpdate[] };

    if (!Array.isArray(updates)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Updates must be an array",
      });
    }

    // Обновляем порядок всех категорий в одной транзакции
    await prisma.$transaction(
      updates.map((update) =>
        prisma.categories.update({
          where: { id: update.id },
          data: { display_order: update.display_order },
        })
      )
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error updating category order:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to update category order",
    });
  }
});
