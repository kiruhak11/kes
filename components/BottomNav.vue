<template>
    <nav class="bottom-nav">
      <NuxtLink to="/" class="bottom-nav__item" active-class="active">
        <svg viewBox="0 0 24 24" class="icon"><path d="M3 12 L12 3 L21 12 V21 H3 Z"/></svg>
        <span>Главная</span>
      </NuxtLink>
      <NuxtLink to="/catalog" class="bottom-nav__item" active-class="active">
        <svg viewBox="0 0 24 24" class="icon"><path d="M4 4 H20 V20 H4 Z"/></svg>
        <span>Каталог</span>
      </NuxtLink>
      <NuxtLink to="/about" class="bottom-nav__item" active-class="active">
        <svg viewBox="0 0 24 24" class="icon"><circle cx="12" cy="8" r="4"/><rect x="6" y="14" width="12" height="6"/></svg>
        <span>О нас</span>
      </NuxtLink>
      <NuxtLink to="/blog" class="bottom-nav__item" active-class="active">
        <svg viewBox="0 0 24 24" class="icon"><path d="M4 4 H20 V12 H4 Z M4 14 H20 V20 H4 Z"/></svg>
        <span>Блог</span>
      </NuxtLink>
      <NuxtLink to="/contact" class="bottom-nav__item" active-class="active">
        <svg viewBox="0 0 24 24" class="icon"><path d="M2 3h20v18H2z M2 3l10 9L22 3"/></svg>
        <span>Контакты</span>
      </NuxtLink>
    </nav>
  </template>
  
  <script setup>
  // компонент без логики
  </script>
  
  <style lang="scss" scoped>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    height: 60px;
    padding-top: 8px;
    right: 0;
    display: flex;
    justify-content: space-around;
    padding: 0.5rem 0;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(12px);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
    border-top: 1px solid rgba(255,255,255,0.3);
    z-index: 100;
  
    .bottom-nav__item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: var(--text);
      text-decoration: none;
      font-size: 0.75rem;
      padding: 0.25rem 0;
      transition: background 0.3s, color 0.3s;
  
      .icon {
        width: 24px;
        height: 24px;
        margin-bottom: 0.25rem;
        fill: var(--text);
        transition: fill 0.3s;
      }
  
      &.active,
      &:hover {
        background: rgba(255, 255, 255, 0.4);
        color: var(--accent);
  
        .icon {
          fill: var(--accent);
        }
      }
    }
  }
  
  /* Тёмная тема */
  :deep([data-theme="dark"]) .bottom-nav {
    background: rgba(0, 0, 0, 0.35);
    border-top: 1px solid rgba(255,255,255,0.2);
  
    .bottom-nav__item {
      color: var(--bg);
  
      &.active,
      &:hover {
        background: rgba(0, 0, 0, 0.5);
        color: var(--accent);
  
        .icon {
          fill: var(--accent);
        }
      }
    }
  }
  </style>
  