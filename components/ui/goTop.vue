<template>
  <button
    v-show="showButton"
    @click="scrollToTop"
    class="go-top-button"
    :class="{ mobile: isMobile }"
    aria-label="Прокрутить наверх"
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M18 15l-6-6-6 6" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const showButton = ref(false);
const isMobile = ref(false);

const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768;
};

const handleScroll = () => {
  showButton.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

onMounted(() => {
  checkDevice();
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", checkDevice);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", checkDevice);
});
</script>

<style scoped lang="scss">
.go-top-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-hover) 100%
  );
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(227, 30, 36, 0.2);
  z-index: 1000;
  opacity: 0.9;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(227, 30, 36, 0.25);
    opacity: 1;
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateY(-2px);
  }

  // Мобильная версия
  &.mobile {
    bottom: 85px; // Поднимаем выше нижней навигации
    right: 20px;
    width: 40px;
    height: 40px;
    background: #fff;
    color: var(--primary);
    border: 2px solid var(--primary);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

    svg {
      width: 20px;
      height: 20px;
      stroke-width: 2.5;
    }

    &::before {
      content: "";
      position: absolute;
      inset: -2px;
      background: linear-gradient(
        135deg,
        var(--primary) 0%,
        var(--primary-hover) 100%
      );
      border-radius: 50%;
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:active {
      transform: scale(0.95);
      background: var(--primary);
      color: white;

      &::before {
        opacity: 1;
      }
    }

    // Добавляем ripple эффект при нажатии
    &::after {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: var(--primary);
      opacity: 0;
      transform: scale(1);
      transition: all 0.4s ease-out;
    }

    &:active::after {
      opacity: 0.3;
      transform: scale(1.5);
    }
  }
}

// Анимация появления/исчезновения
.go-top-button {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 0.9;
    transform: translateY(0);
  }
}

// Темная тема
@media (prefers-color-scheme: dark) {
  .go-top-button.mobile {
    background: var(--bg-dark);
    border-color: var(--primary);
    color: var(--primary);

    &:active {
      background: var(--primary);
      color: var(--bg-dark);
    }
  }
}
</style>
