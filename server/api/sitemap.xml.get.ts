import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

export default defineEventHandler(async (event) => {
  try {
    // Получаем все категории
    const categories = await prisma.categories.findMany({
      orderBy: {
        display_order: "asc",
      },
    });

    // Получаем все товары
    const products = await prisma.products.findMany({
      include: {
        categories: true,
      },
    });

    // Генерируем XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Главная страница
    xml += "  <url>\n";
    xml += "    <loc>https://kes-sib.ru/</loc>\n";
    xml +=
      "    <lastmod>" + new Date().toISOString().split("T")[0] + "</lastmod>\n";
    xml += "    <changefreq>weekly</changefreq>\n";
    xml += "    <priority>1.0</priority>\n";
    xml += "  </url>\n";

    // Каталог
    xml += "  <url>\n";
    xml += "    <loc>https://kes-sib.ru/catalog</loc>\n";
    xml +=
      "    <lastmod>" + new Date().toISOString().split("T")[0] + "</lastmod>\n";
    xml += "    <changefreq>weekly</changefreq>\n";
    xml += "    <priority>0.9</priority>\n";
    xml += "  </url>\n";

    // Страница "О заводе"
    xml += "  <url>\n";
    xml += "    <loc>https://kes-sib.ru/about</loc>\n";
    xml +=
      "    <lastmod>" + new Date().toISOString().split("T")[0] + "</lastmod>\n";
    xml += "    <changefreq>monthly</changefreq>\n";
    xml += "    <priority>0.8</priority>\n";
    xml += "  </url>\n";

    // Страницы категорий
    for (const category of categories) {
      if (category.slug) {
        xml += "  <url>\n";
        xml +=
          "    <loc>https://kes-sib.ru/catalog/" + category.slug + "</loc>\n";
        xml +=
          "    <lastmod>" +
          new Date().toISOString().split("T")[0] +
          "</lastmod>\n";
        xml += "    <changefreq>weekly</changefreq>\n";
        xml += "    <priority>0.8</priority>\n";
        xml += "  </url>\n";
      }
    }

    // Страницы товаров
    for (const product of products) {
      if (product.category_slug) {
        xml += "  <url>\n";
        xml +=
          "    <loc>https://kes-sib.ru/catalog/" +
          product.category_slug +
          "/" +
          (product.name
            ?.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") || `product-${product.id}`) +
          "</loc>\n";
        xml +=
          "    <lastmod>" +
          new Date().toISOString().split("T")[0] +
          "</lastmod>\n";
        xml += "    <changefreq>monthly</changefreq>\n";
        xml += "    <priority>0.7</priority>\n";
        xml += "  </url>\n";
      }
    }

    // Остальные страницы
    const staticPages = [
      { url: "/about", priority: "0.8", changefreq: "monthly" },
      { url: "/about/contacts", priority: "0.8", changefreq: "monthly" },
      { url: "/contact", priority: "0.8", changefreq: "monthly" },
      { url: "/certificates", priority: "0.7", changefreq: "monthly" },
      { url: "/vacancies", priority: "0.6", changefreq: "weekly" },
      { url: "/questionnaire", priority: "0.6", changefreq: "monthly" },
    ];

    for (const page of staticPages) {
      xml += "  <url>\n";
      xml += "    <loc>https://kes-sib.ru" + page.url + "</loc>\n";
      xml +=
        "    <lastmod>" +
        new Date().toISOString().split("T")[0] +
        "</lastmod>\n";
      xml += "    <changefreq>" + page.changefreq + "</changefreq>\n";
      xml += "    <priority>" + page.priority + "</priority>\n";
      xml += "  </url>\n";
    }

    xml += "</urlset>";

    // Устанавливаем заголовки для XML
    setHeader(event, "Content-Type", "application/xml");
    setHeader(event, "Cache-Control", "public, max-age=3600"); // Кэшируем на 1 час

    return xml;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  } finally {
    await prisma.$disconnect();
  }
});
