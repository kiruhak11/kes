ARG NODE_VERSION=20.19.0

FROM node:${NODE_VERSION}-slim as base

RUN apt-get update && apt-get install -y \
  openssl \
  libssl-dev \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ARG PORT=3001

WORKDIR /app

# Build
FROM base as build

# Копируем файлы package.json и package-lock.json
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Устанавливаем зависимости с принудительным разрешением конфликтов
RUN npm install --production=false --legacy-peer-deps --force

# Генерируем Prisma Client до копирования остальных файлов
# Временная DATABASE_URL для генерации (реальная строка подключения не нужна для генерации)
ENV DATABASE_URL="mysql://user:password@localhost:3306/database"
RUN npx prisma generate

# Копируем все остальные файлы проекта
COPY . .

# Сборка приложения
ENV NODE_ENV=production
ENV NUXT_TELEMETRY_DISABLED=1
RUN npm run build
RUN npm prune --production

# Run
FROM base

ENV NODE_ENV=production
ENV PORT=$PORT
ENV NUXT_TELEMETRY_DISABLED=1

COPY --from=build /app /app

# Создаем папку для загрузок
RUN mkdir -p /app/public/uploads && chmod 755 /app/public/uploads

# Проверяем и регенерируем Prisma при запуске
CMD ["sh", "-c", "cd /app && npx prisma generate && npx prisma migrate deploy && node .output/server/index.mjs"] 
