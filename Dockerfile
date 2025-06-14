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

RUN npm run build
RUN npm prune

# Run
FROM base

ENV PORT=$PORT

COPY --from=build /app /app

# Применение миграций при запуске контейнера
CMD ["sh", "-c", "node .output/server/index.mjs"] 