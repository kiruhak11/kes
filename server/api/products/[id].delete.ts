import { defineEventHandler, createError } from "h3";
import { promises as fs } from "fs";
import { resolve } from "path";

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  const file = resolve(process.cwd(), "data/products.json");
  const content = await fs.readFile(file, "utf-8");
  const products = JSON.parse(content) as any[];

  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1)
    throw createError({ statusCode: 404, statusMessage: "Not found" });

  const [deleted] = products.splice(idx, 1);
  await fs.writeFile(file, JSON.stringify(products, null, 2), "utf-8");
  return deleted;
});
