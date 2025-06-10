import { defineEventHandler, readBody, createError } from "h3";
import { promises as fs } from "fs";
import { resolve } from "path";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name?: string;
    description?: string;
    price?: number;
    image?: string;
  }>(event);
  if (!body.name || !body.description || typeof body.price !== "number") {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: name, description and price are required",
    });
  }

  const file = resolve(process.cwd(), "data/products.json");
  const content = await fs.readFile(file, "utf-8");
  const products = JSON.parse(content) as any[];

  const newId = products.length
    ? Math.max(...products.map((p) => p.id)) + 1
    : 1;
  const newProd = { id: newId, ...body };
  products.push(newProd);

  await fs.writeFile(file, JSON.stringify(products, null, 2), "utf-8");
  return newProd;
});
