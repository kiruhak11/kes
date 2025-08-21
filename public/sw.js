// Оптимизированный Service Worker для максимального кэширования

const CACHE_NAME = "kes-sib-v1";
const STATIC_CACHE = "static-v1";
const API_CACHE = "api-v1";
const IMAGE_CACHE = "images-v1";

// Ресурсы для кэширования
const STATIC_ASSETS = ["/", "/catalog", "/about", "/contacts", "/offline"];

const API_ENDPOINTS = ["/api/categories", "/api/products/list"];

// Стратегии кэширования
const CACHE_STRATEGIES = {
  // Статические ресурсы - Cache First
  static: "cache-first",
  // API данные - Network First с fallback
  api: "network-first",
  // Изображения - Cache First с длительным хранением
  images: "cache-first",
  // HTML страницы - Stale While Revalidate
  pages: "stale-while-revalidate",
};

// Установка Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      // Кэшируем статические ресурсы
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Предзагружаем критические API данные безопасно
      caches.open(API_CACHE).then((cache) => {
        return Promise.allSettled(
          API_ENDPOINTS.map(async (url) => {
            try {
              const response = await fetch(url);
              if (response.ok) {
                await cache.put(url, response.clone());
              }
            } catch (error) {
              console.warn(`Failed to preload ${url}:`, error);
            }
          })
        );
      }),
    ])
  );

  // Принудительная активация нового SW
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Очищаем старые кэши
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== API_CACHE &&
              cacheName !== IMAGE_CACHE
            ) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Захватываем управление всеми клиентами
      self.clients.claim(),
    ])
  );
});

// Обработка запросов
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Игнорируем не-GET запросы
  if (request.method !== "GET") {
    return;
  }

  // Определяем стратегию кэширования
  let strategy = CACHE_STRATEGIES.pages;
  let cacheName = CACHE_NAME;

  if (url.pathname.startsWith("/api/")) {
    strategy = CACHE_STRATEGIES.api;
    cacheName = API_CACHE;
  } else if (
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i) ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/uploads/")
  ) {
    strategy = CACHE_STRATEGIES.images;
    cacheName = IMAGE_CACHE;
  } else if (url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/i)) {
    strategy = CACHE_STRATEGIES.static;
    cacheName = STATIC_CACHE;
  }

  event.respondWith(handleRequest(request, strategy, cacheName));
});

// Обработчик запросов с разными стратегиями
async function handleRequest(request, strategy, cacheName) {
  const cache = await caches.open(cacheName);

  switch (strategy) {
    case "cache-first":
      return cacheFirst(request, cache);
    case "network-first":
      return networkFirst(request, cache);
    case "stale-while-revalidate":
      return staleWhileRevalidate(request, cache);
    default:
      return fetch(request);
  }
}

// Cache First стратегия
async function cacheFirst(request, cache) {
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Возвращаем offline страницу для навигационных запросов
    if (request.mode === "navigate") {
      return cache.match("/offline");
    }
    throw error;
  }
}

// Network First стратегия
async function networkFirst(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Кэшируем только успешные ответы
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate стратегия
async function staleWhileRevalidate(request, cache) {
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Очистка старых кэшей по расписанию
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAN_CACHE") {
    cleanOldCache();
  }
});

async function cleanOldCache() {
  const imageCache = await caches.open(IMAGE_CACHE);
  const requests = await imageCache.keys();

  // Удаляем изображения старше 7 дней
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const request of requests) {
    const response = await imageCache.match(request);
    if (response) {
      const dateHeader = response.headers.get("date");
      if (dateHeader && new Date(dateHeader).getTime() < oneWeekAgo) {
        await imageCache.delete(request);
      }
    }
  }
}
