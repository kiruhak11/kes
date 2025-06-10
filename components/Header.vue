<template>
  <header class="site-header">
    <div class="container header-inner">
      <NuxtLink to="/" class="logo-link" exact-active-class="active-link">
        <img src="/logo.svg" alt="Логотип Котлы Барнаул" class="logo-img" />
      </NuxtLink>
      <nav class="main-nav">
        <ul class="nav-list">
          <li>
            <NuxtLink to="/" exact-active-class="active-link" class="nav-link">
              Главная
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/catalog" active-class="active-link" class="nav-link">
              Каталог
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/about" active-class="active-link" class="nav-link">
              О нас
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/blog" active-class="active-link" class="nav-link">
              Статьи
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/contact" active-class="active-link" class="nav-link">
              Контакты
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="header-actions">
        <ThemeSwitcher />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";
</script>

<style lang="scss" scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--primary);
  backdrop-filter: blur(12px);

  .header-inner {
    @include container();
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
  }

  .logo-img {
    height: 48px;
  }

  .main-nav {
    .nav-list {
      display: flex;
      gap: 2rem;
      list-style: none;
      padding: 0;
      margin: 0;

      .nav-link {
        position: relative;
        font-weight: 500;
        color: #ecf0f1;
        text-decoration: none;
        padding: 0.25rem 0;
        transition: color 0.2s;

        &:hover {
          color: var(--accent);
          animation: flame-glow 1.5s infinite ease-in-out;
          text-shadow: 0 0 4px var(--accent), 0 0 8px var(--accent),
            0 0 16px var(--accent);
        }
      }

      .active-link {
        color: var(--accent);
        animation: flame-glow 1.5s infinite ease-in-out;
        text-shadow: 0 0 4px var(--accent), 0 0 8px var(--accent),
          0 0 16px var(--accent);
      }
    }
  }

  .header-actions {
    button {
      font-size: 1.25rem;
    }
  }

  @include respond-to(sm) {
    .main-nav {
      display: none;
    }
  }
}

/* Анимация пульсации «огненного свечения» */
@keyframes flame-glow {
  0%,
  100% {
    text-shadow: 0 0 4px var(--accent), 0 0 8px var(--accent),
      0 0 16px var(--accent);
  }
  50% {
    text-shadow: 0 0 6px var(--accent), 0 0 12px var(--accent),
      0 0 24px var(--accent);
  }
}
</style>
