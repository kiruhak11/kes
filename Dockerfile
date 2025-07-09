ARG NODE_VERSION=20.11.0

FROM node:${NODE_VERSION}-slim as base

RUN apt-get update && apt-get install -y \
  openssl \
  libssl-dev

ARG PORT=3001

WORKDIR /app

# Build
FROM base as build

# Копируем файлы package.json и package-lock.json
COPY package*.json ./
COPY prisma ./prisma

# Устанавливаем зависимости
RUN npm install --production=false

# Генерируем Prisma Client до копирования остальных файлов
RUN npx prisma generate

# Копируем все остальные файлы проекта
COPY . .

# Сборка приложения
ENV NODE_ENV=production
RUN npm run build
RUN npm prune

# Run
FROM base

ENV NODE_ENV=production
ENV PORT=$PORT

COPY --from=build /app /app

# Создаем папку для загрузок
RUN mkdir -p /app/public/uploads && chmod 755 /app/public/uploads

# Проверяем и регенерируем Prisma при запуске
CMD ["sh", "-c", "cd /app && npx prisma generate && npx prisma migrate deploy && node .output/server/index.mjs"] 
