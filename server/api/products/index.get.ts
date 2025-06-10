import { defineEventHandler } from "h3";
import { readFileSync } from "fs";
import { resolve } from "path";

export default defineEventHandler(() => {
  const file = resolve(process.cwd(), "data/products.json");
  const content = readFileSync(file, "utf-8");
  return JSON.parse(content);
});
