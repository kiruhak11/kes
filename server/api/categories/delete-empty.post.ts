import { defineEventHandler, createError } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Находим все категории без продуктов
    const emptyCategories = await prisma.categories.findMany({
      where: {
        products: {
          none: {},
        },
      },
    });

    if (emptyCategories.length === 0) {
      return { deleted: 0 };
    }

    // Удаляем пустые категории
    await prisma.categories.deleteMany({
      where: {
        id: {
          in: emptyCategories.map((cat) => cat.id),
        },
      },
    });

    return { deleted: emptyCategories.length };
  } catch (error: any) {
    console.error("Error deleting empty categories:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to delete empty categories",
    });
  }
});
