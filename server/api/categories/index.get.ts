import { defineEventHandler, createError } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Получаем категории, сортируя по display_order
    const categories = await prisma.categories.findMany({
      orderBy: { display_order: "asc" },
    });

    // Получаем изображения для каждой категории
    const categoriesWithImages = await Promise.all(
      categories.map(async (cat) => {
        const products = await prisma.products.findMany({
          where: { category_id: cat.id },
          select: { image: true },
        });

        return {
          ...cat,
          images: products.map((p) => p.image).filter(Boolean),
        };
      })
    );

    return { categories: categoriesWithImages };
  } catch (e: any) {
    console.error("GET /api/categories error:", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.message || "Internal Server Error",
    });
  }
});
