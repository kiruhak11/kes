import { defineEventHandler, createError } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Получаем категории с подсчетом продуктов в одном запросе
    const categories = await prisma.categories.findMany({
      orderBy: { display_order: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        display_order: true,
        _count: {
          select: { products: true },
        },
        products: {
          select: {
            id: true,
            image: true,
          },
        },
      },
    });

    // Трансформируем данные для ответа
    const categoriesWithImages = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      slug: cat.slug,
      display_order: cat.display_order,
      productsCount: cat._count.products,
      images: cat.products.map((p) => p.image).filter(Boolean),
    }));

    return { categories: categoriesWithImages };
  } catch (e: any) {
    console.error("GET /api/categories error:", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.message || "Internal Server Error",
    });
  }
});
