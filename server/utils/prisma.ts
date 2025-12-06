import { PrismaClient } from "@prisma/client";
import { PrismaMySql } from "@prisma/adapter-mysql";

let prisma: PrismaClient;

// Функция для создания PrismaClient с адаптером
function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const adapter = new PrismaMySql({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
  });
}

// Проверяем, что мы не в процессе сборки
if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = createPrismaClient();
  }
  prisma = (global as any).prisma;
}

export default prisma;
