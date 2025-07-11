import { defineEventHandler, createError, getQuery } from "h3";
import prisma from "~/server/utils/prisma";
import { convertSpecsToCharacteristics } from "~/utils/characteristics";

interface Product {
  id: number;
  name: string | null;
  categories: any;
  specs: any;
  additional_images?: any;
  [key: string]: any;
}

interface ProductWithCategory extends Record<string, any> {}

interface ProductSpecs {
  power?: string;
  fuel?: string[] | string;
  [key: string]: any;
}

interface ProductWithCharacteristics extends Record<string, any> {}

interface Characteristic {
  id: number;
  key: string;
  value: string;
}

function generateSlug(text: string): string {
  // Транслитерация кириллицы
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
    ъ: "",
    ы: "y",
    ь: "",
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
    const categorySlug = query.categorySlug as string | undefined;
    const productSlug = query.productSlug as string | undefined;
    const exclude = query.exclude as string | undefined;
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 15; // Дефолт 15
    const offset = (page - 1) * limit;

    // Фильтры
    const priceMin = query.priceMin
      ? parseFloat(query.priceMin as string)
      : undefined;
    const priceMax = query.priceMax
      ? parseFloat(query.priceMax as string)
      : undefined;
    const filters = query.filters ? JSON.parse(query.filters as string) : {};

    const where: any = {};
    if (categorySlug && categorySlug !== "all") {
      where.categories = { slug: categorySlug };
    }
    // Исключение будет обрабатываться после получения товаров
    // так как slug генерируется динамически из name

    // Фильтр по цене
    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) {
        where.price.gte = priceMin;
      }
      if (priceMax !== undefined) {
        where.price.lte = priceMax;
      }
    }

    // Фильтры по характеристикам
    if (Object.keys(filters).length > 0) {
      where.AND = [];
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "") {
          where.AND.push({
            specs: {
              path: `$.${key}`,
              equals: value,
            },
          });
        }
      });
    }

    let products;
    let total;

    if (productSlug && productSlug !== "undefined") {
      // Ищем конкретный товар по slug
      products = await prisma.products.findMany({
        where,
        include: { categories: true },
        orderBy: { id: "asc" },
      });

      // Фильтруем по slug
      products = products.filter((product) => {
        if (!product.name) return false;
        const productSlugGenerated = generateSlug(product.name);
        return productSlugGenerated === productSlug;
      });

      total = products.length;
    } else {
      // Загружаем все товары из категории
      products = await prisma.products.findMany({
        where,
        include: { categories: true },
        orderBy: { id: "asc" },
      });

      total = products.length;
    }

    if (!products || products.length === 0) {
      return {
        products: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    // Transform products to include category info and convert specs
    const transformedProducts: ProductWithCharacteristics[] = products.map(
      (product: Product) => {
        const category = product.categories as any;

        // Convert specs from object to characteristics array
        const characteristics = convertSpecsToCharacteristics(
          product.specs as Record<string, any>
        );

        // Ensure characteristics is always an array
        const finalSpecs = Array.isArray(characteristics)
          ? characteristics
          : [];

        return {
          ...product,
          category_name: category?.name || "",
          category_slug: category?.slug || "",
          slug: product.name ? generateSlug(product.name) : "",
          specs: finalSpecs,
        };
      }
    );

    return {
      products: transformedProducts,
      pagination: {
        total,
        page: productSlug ? 1 : page,
        limit: productSlug ? total : limit,
        totalPages: productSlug ? 1 : Math.ceil(total / limit),
      },
    };
  } catch (e: any) {
    console.error("GET /api/products error:", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Internal Server Error",
    });
  }
});
