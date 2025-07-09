ARG NODE_VERSION=20.11.0

FROM node:${NODE_VERSION}-slim as base

RUN apt-get update && apt-get install -y \
  openssl \
  libssl-dev

ARG PORT=3001

ENV NODE_ENV=production

WORKDIR /app

# Build
FROM base as build

# Копируем файлы package.json и package-lock.json
COPY package*.json ./
COPY prisma ./prisma

# Устанавливаем зависимости
RUN npm install --production=false

# Копируем все остальные файлы проекта
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Очистка кэша и пересборка для уверенности
RUN npm cache clean --force
RUN rm -rf node_modules
RUN npm install --production=false

# Проверяем наличие Prisma Client
RUN ls -la node_modules/.prisma/client

# Сборка приложения
RUN npm run build
RUN npm prune

# Run
FROM base

ENV PORT=$PORT

COPY --from=build /app /app

# Создаем папку для загрузок
RUN mkdir -p /app/public/uploads && chmod 755 /app/public/uploads

# Проверяем наличие Prisma Client в финальном образе
RUN ls -la /app/node_modules/.prisma/client || echo "Prisma client not found in final image"

# Применение миграций при запуске контейнера
CMD ["sh", "-c", "cd /app && npx prisma generate && npx prisma migrate deploy && node .output/server/index.mjs"] 
