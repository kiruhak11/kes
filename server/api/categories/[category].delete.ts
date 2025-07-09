import { defineEventHandler, createError } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const categoryId = event.context.params?.category;
    if (!categoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Category ID is required",
      });
    }

    // Проверяем наличие продуктов в категории
    const productsCount = await prisma.products.count({
      where: { category_id: String(categoryId) },
    });

    if (productsCount > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete category with ${productsCount} products. Remove all products first.`,
      });
    }

    // Удаляем категорию
    await prisma.categories.delete({ where: { id: String(categoryId) } });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to delete category",
    });
  }
});
