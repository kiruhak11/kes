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

COPY package*.json ./

RUN npm install --production=false

COPY . .

# Генерация Prisma
COPY prisma ./prisma
RUN npx prisma generate

# Очистка кэша npm и node_modules перед сборкой
RUN npm cache clean --force
RUN rm -rf node_modules
RUN npm install --production=false

# Сборка приложения
RUN npm run build
RUN npm prune

# Run
FROM base

ENV PORT=$PORT

COPY --from=build /app /app

# Создаем папку для загрузок
RUN mkdir -p /app/public/uploads && chmod 755 /app/public/uploads

# Применение миграций при запуске контейнера
CMD ["sh", "-c", "npx prisma migrate deploy && node .output/server/index.mjs"] 
