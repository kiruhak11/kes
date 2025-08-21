import { defineEventHandler, createError, getQuery } from "h3";
import prisma from "~/server/utils/prisma";

function generateSlug(text: string): string {
  const translitMap: { [key: string]: string } = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "-",
    ы: "y",
    ь: "-",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return text
    .toLowerCase()
    .split("")
    .map((char) => translitMap[char] || char)
    .join("")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const productSlug = query.slug as string;
    const categorySlug = query.category as string;

    if (!productSlug || !categorySlug) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product slug and category slug are required",
      });
    }

    // Находим категорию
    const category = await prisma.categories.findFirst({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: "Category not found",
      });
    }

    // Находим все товары в категории
    const products = await prisma.products.findMany({
      where: {
        categories: {
          slug: categorySlug,
        },
      },
      include: {
        categories: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // Ищем товар по сгенерированному слагу
    const product = products.find((p) => {
      if (!p.name) return false;
      const generatedSlug = generateSlug(p.name);
      return generatedSlug === productSlug;
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
      slug: generateSlug(product.name || ""),
      categories: undefined, // Убираем исходное поле categories
    };

    return { product: fullProduct };
  } catch (e: any) {
    console.error("GET /api/products/by-slug error:", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Internal Server Error",
    });
  }
});
