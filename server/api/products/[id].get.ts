import { defineEventHandler, createError } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const productId = event.context.params?.id;
    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product ID is required",
      });
    }

    // Получаем полную информацию о товаре
    const product = await prisma.products.findUnique({
      where: { id: Number(productId) },
      include: {
        categories: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product not found",
      });
    }

    // Формируем полный ответ
    const fullProduct = {
      ...product,
      category_name: product.categories?.name || "",
      category_slug: product.categories?.slug || "",
      categories: undefined, // Убираем исходное поле categories
    };

    return { product: fullProduct };
  } catch (e: any) {
    console.error("GET /api/products/[id] error:", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Internal Server Error",
    });
  }
});
