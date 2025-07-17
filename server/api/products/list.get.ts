import { defineEventHandler, createError, getQuery } from "h3";
import prisma from "~/server/utils/prisma";

interface Spec {
  key: string;
  value: string;
  show_in_filters?: boolean;
}

function isSpec(obj: any): obj is Spec {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.key === "string" &&
    typeof obj.value === "string" &&
    (obj.show_in_filters === undefined ||
      typeof obj.show_in_filters === "boolean")
  );
}

function parseSpecs(specs: unknown): Spec[] {
  if (!Array.isArray(specs)) return [];
  return specs.filter(isSpec);
}

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

    // Получаем все товары без фильтрации по характеристикам
    const products = await prisma.products.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        specs: true,
        categories: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    // Фильтруем товары по характеристикам на стороне сервера
    let filteredProducts = products;
    if (Object.keys(filters).length > 0) {
      filteredProducts = products.filter((product) => {
        const specs = parseSpecs(product.specs);
        return Object.entries(filters).every(([filterKey, filterValue]) => {
          if (!filterValue) return true;
          return specs.some(
            (spec) => spec.key === filterKey && spec.value === filterValue
          );
        });
      });
    }

    // Собираем уникальные характеристики для фильтров
    const filterSpecs = new Map<string, Set<string>>();
    filteredProducts.forEach((product) => {
      const specs = parseSpecs(product.specs);
      specs.forEach((spec) => {
        if (spec.show_in_filters) {
          if (!filterSpecs.has(spec.key)) {
            filterSpecs.set(spec.key, new Set());
          }
          filterSpecs.get(spec.key)?.add(spec.value);
        }
      });
    });

    // Преобразуем Map в объект для ответа
    const availableFilters = Array.from(filterSpecs.entries()).map(
      ([key, values]) => ({
        key,
        values: Array.from(values).sort(),
      })
    );

    // Трансформируем продукты, оставляя только нужные поля
    const transformedProducts = filteredProducts.map((product) => {
      const specs = parseSpecs(product.specs);
      const filterSpecs = specs.filter((spec) => spec.show_in_filters);
      const previewSpecs = specs.slice(0, 4);
      const uniqueSpecs = [...new Set([...filterSpecs, ...previewSpecs])];

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category_name: product.categories?.name || "",
        category_slug: product.categories?.slug || "",
        slug: product.name ? generateSlug(product.name) : "",
        specs: uniqueSpecs,
      };
    });

    return {
      products: transformedProducts,
      total: filteredProducts.length,
      availableFilters,
    };
  } catch (e: any) {
    console.error("GET /api/products/list error:", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Internal Server Error",
    });
  }
});
