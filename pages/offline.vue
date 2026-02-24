<template>
  <div class="offline-page">
    <div class="container">
      <div class="offline-content">
        <div class="offline-icon">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="#e31e24"
            />
          </svg>
        </div>

        <h1 class="offline-title">Нет подключения к интернету</h1>

        <p class="offline-description">
          Проверьте подключение к интернету и попробуйте снова. Некоторые
          страницы могут быть доступны из кэша.
        </p>

        <div class="offline-actions">
          <button @click="retry" class="retry-button">Попробовать снова</button>

          <NuxtLink to="/" class="home-button"> На главную </NuxtLink>
        </div>

        <div class="cached-pages">
          <h3>Доступные страницы:</h3>
          <ul>
            <li><NuxtLink to="/">Главная</NuxtLink></li>
            <li><NuxtLink to="/catalog">Каталог</NuxtLink></li>
            <li><NuxtLink to="/about">О заводе</NuxtLink></li>
            <li><NuxtLink to="/contacts">Контакты</NuxtLink></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO для offline страницы
useSeoMeta({
  title: "Нет подключения - КотлоЭнергоСнаб",
  description: "Страница отображается при отсутствии подключения к интернету",
  robots: "noindex, nofollow",
});

const retry = () => {
  window.location.reload();
};

// Проверяем статус подключения
const isOnline = ref(true);

onMounted(() => {
  if (process.client) {
    isOnline.value = navigator.onLine;

    const handleOnline = () => {
      isOnline.value = true;
      // Автоматически перенаправляем на предыдущую страницу
      if (document.referrer) {
        window.location.href = document.referrer;
      } else {
        navigateTo("/");
      }
    };

    const handleOffline = () => {
      isOnline.value = false;
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    onUnmounted(() => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    });
  }
});
</script>

<style lang="scss" scoped>
.offline-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.offline-content {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.offline-icon {
  margin-bottom: 1.5rem;

  svg {
    opacity: 0.8;
  }
}

.offline-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.offline-description {
  color: #718096;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.offline-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.retry-button,
.home-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease,
    border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  border: none;
  cursor: pointer;
}

.retry-button {
  background: #e31e24;
  color: white;

  &:hover {
    background: #c41e3a;
    transform: translateY(-1px);
  }
}

.home-button {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;

  &:hover {
    background: #edf2f7;
    transform: translateY(-1px);
  }
}

.cached-pages {
  text-align: left;

  h3 {
    font-size: 1.1rem;
    color: #4a5568;
    margin-bottom: 0.5rem;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 0.25rem;

      a {
        color: #e31e24;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .offline-content {
    margin: 1rem;
    padding: 1.5rem;
  }

  .offline-title {
    font-size: 1.5rem;
  }

  .offline-actions {
    flex-direction: column;
    align-items: center;
  }

  .retry-button,
  .home-button {
    width: 100%;
    max-width: 200px;
  }
}
</style>
