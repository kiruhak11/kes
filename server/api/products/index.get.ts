import { defineEventHandler, createError } from "h3";
import { promises as fs, existsSync } from "fs";
import { resolve } from "path";

export default defineEventHandler(async () => {
  try {
    const file = resolve(process.cwd(), "data/products.json");
    if (!existsSync(file)) {
      await fs.mkdir(resolve(process.cwd(), "data"), { recursive: true });
      await fs.writeFile(file, "[]", "utf-8");
    }
    const content = await fs.readFile(file, "utf-8");
    return JSON.parse(content);
  } catch (e: any) {
    console.error("GET /api/products error:", e);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
