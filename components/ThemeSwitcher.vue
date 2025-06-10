<template>
  <button
    class="theme-switcher"
    @click="toggle"
    :aria-label="
      theme === 'light'
        ? 'Переключить на тёмную тему'
        : 'Переключить на светлую тему'
    "
  >
    <transition name="switch" mode="out-in">
      <svg
        v-if="theme === 'light'"
        key="light"
        class="boiler icon hot"
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Корпус котла -->
        <rect x="10" y="30" width="60" height="30" rx="8" ry="8" class="body" />
        <!-- Верхняя крышка -->
        <rect x="10" y="24" width="60" height="8" rx="4" ry="4" class="lid" />
        <!-- Труба слева -->
        <rect x="4" y="36" width="6" height="18" rx="3" ry="3" class="pipe" />
        <!-- Труба справа -->
        <rect x="70" y="36" width="6" height="18" rx="3" ry="3" class="pipe" />
        <!-- Пламя -->
        <g class="flames">
          <path
            d="M40 30 c-6 0 -8 6 -8 12 s4 10 4 16 c0 6 8 8 8 8 s8-2 8-8 c0-6 4-10 4-16 s-2-12 -8-12 z"
          />
        </g>
      </svg>

      <svg
        v-else
        key="dark"
        class="boiler icon cold"
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Корпус котла -->
        <rect x="10" y="30" width="60" height="30" rx="8" ry="8" class="body" />
        <!-- Верхняя крышка -->
        <rect x="10" y="24" width="60" height="8" rx="4" ry="4" class="lid" />
        <!-- Труба слева -->
        <rect x="4" y="36" width="6" height="18" rx="3" ry="3" class="pipe" />
        <!-- Труба справа -->
        <rect x="70" y="36" width="6" height="18" rx="3" ry="3" class="pipe" />
        <!-- Иней -->
        <g class="frost">
          <circle cx="40" cy="46" r="8" />
          <circle cx="30" cy="40" r="5" />
          <circle cx="50" cy="40" r="5" />
        </g>
      </svg>
    </transition>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";
const { theme, setTheme } = useTheme();
const toggle = () => setTheme(theme.value === "light" ? "dark" : "light");
</script>

<style lang="scss" scoped>
.theme-switcher {
  width: 64px;
  height: 64px;
  background-color: var(--bg);
  border: 2px solid var(--secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s, box-shadow 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.boiler {
  width: 48px;
  height: 48px;
}

/* Переход между состояниями */
.switch-enter-active,
.switch-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.switch-enter-from,
.switch-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.switch-enter-to,
.switch-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* Стили корпуса и труб */
.body,
.lid,
.pipe {
  fill: var(--secondary);
}

/* Живая анимация пламени */
.hot .flames path {
  fill: var(--accent);
  animation: flame-shape 1.8s infinite ease-in-out,
    flame-color 3s infinite ease-in-out;
  transform-origin: center bottom;
}
@keyframes flame-shape {
  0%,
  100% {
    transform: scale(1) translateY(0);
  }
  25% {
    transform: scale(1.1, 1.2) translateY(-2px) rotate(-1deg);
  }
  50% {
    transform: scale(0.9, 1.1) translateY(0) rotate(1deg);
  }
  75% {
    transform: scale(1.05, 1.15) translateY(-1px) rotate(-0.5deg);
  }
}
@keyframes flame-color {
  0%,
  100% {
    fill: var(--accent);
  }
  50% {
    fill: #ffbe0b;
  }
}

/* Мягкая пульсация инея */
.cold .frost circle {
  fill: var(--primary);
  opacity: 0.7;
  animation: frost-pulse 3s infinite ease-in-out;
  transform-origin: center;
}
@keyframes frost-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.9;
  }
}
</style>
