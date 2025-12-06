import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

const prismaOptions: any = {};

// Проверяем, что мы не в процессе сборки
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(prismaOptions);
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient(prismaOptions);
  }
  prisma = (global as any).prisma;
}

export default prisma;
