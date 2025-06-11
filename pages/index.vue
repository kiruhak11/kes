<template>
  <section class="hero-section" ref="heroRef">
    <!-- Размытый фон -->
    <div class="hero-bg hero-bg--blur"></div>
    <!-- Чёткий центральный кадр -->
    <div class="hero-bg hero-bg--clear"></div>
    <!-- Тонировочный оверлей -->
    <div class="hero-overlay"></div>

    <div class="container hero-content" :class="{ 'in-view': contentVisible }">
      <h1>КотлоЭнергоСнаб «с нами тепло!»</h1>
      <p>
        КотлоЭнергоСнаб специализируется на производстве и поставке котельного
        оборудования для промышленных предприятий.
      </p>
      <div class="cta-buttons">
        <NuxtLink to="/catalog" class="btn btn-primary"
          >Перейти в каталог</NuxtLink
        >
        <NuxtLink to="/contact" class="btn btn-secondary"
          >Оставить заявку</NuxtLink
        >
      </div>
    </div>
  </section>

  <section class="advantages-section container">
    <div class="advantage-item">
      <svg class="icon" viewBox="0 0 24 24">
        <path d="M12 1l8 4v6c0 5-3.5 9.7-8 11-4.5-1.3-8-6-8-11V5l8-4z" />
      </svg>
      <h3>Гарантия качества</h3>
      <p>Сертифицированное оборудование от ведущих производителей.</p>
    </div>
    <div class="advantage-item">
      <svg class="icon" viewBox="0 0 24 24">
        <path d="M6 2h12l-6 20-6-20z" />
      </svg>
      <h3>Энергоэффективность</h3>
      <p>Современные решения для экономии топлива и снижения затрат.</p>
    </div>
    <div class="advantage-item">
      <svg class="icon" viewBox="0 0 24 24">
        <path
          d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"
        />
      </svg>
      <h3>24/7 поддержка</h3>
      <p>
        Наши менеджеры всегда на связи для оперативного решения ваших задач.
      </p>
    </div>
  </section>


  <section class="offers-section container">
  <h2 class="offers-section__title">Специальные предложения</h2>
  <div class="offers-section__grid">
    <!-- Котлы водогрейные -->
    <div class="offer-card">
      <svg class="offer-card__icon" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Корпус котла -->
        <rect x="10" y="30" width="60" height="30" rx="8" ry="8"/>
        <!-- Верхняя крышка -->
        <rect x="10" y="24" width="60" height="8" rx="4" ry="4"/>
        <!-- Трубы -->
        <rect x="4" y="36" width="6" height="18" rx="3"/>
        <rect x="70" y="36" width="6" height="18" rx="3"/>
      </svg>
      <h3 class="offer-card__title">Котлы водогрейные</h3>
      <p class="offer-card__text">
        Энергосберегающие водогрейные котлы для любых задач – от 0,1 до 100 МВт.
      </p>
    </div>

    <!-- Вентиляторы и дымососы -->
    <div class="offer-card">
      <svg class="offer-card__icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <!-- Простая стилизация вентилятора -->
        <circle cx="32" cy="32" r="4"/>
        <path d="M32 32 L32 8 M32 32 L56 32 M32 32 L32 56 M32 32 L8 32" stroke-width="4" stroke-linecap="round"/>
      </svg>
      <h3 class="offer-card__title">Вентиляторы и дымососы</h3>
      <p class="offer-card__text">
        Надёжные вентиляторы и дымососы для поддержания оптимальной тяги.
      </p>
    </div>

    <!-- Циклоны -->
    <div class="offer-card">
      <svg class="offer-card__icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <!-- Схематичный вихрь -->
        <path d="M32 4
                 C32 4, 12 20, 12 32
                 C12 44, 32 60, 32 60
                 C32 60, 52 44, 52 32
                 C52 20, 32 4, 32 4 Z"
              fill="none" stroke-width="4" stroke-linecap="round"/>
      </svg>
      <h3 class="offer-card__title">Циклоны</h3>
      <p class="offer-card__text">
        Высокоэффективные циклонные установки для очистки газов от твёрдых частиц.
      </p>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const heroRef = ref<HTMLElement | null>(null);
const contentVisible = ref(false);

onMounted(() => {
  if (heroRef.value) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          contentVisible.value = true;
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(heroRef.value);
  }
});
</script>

<style lang="scss" scoped>
.hero-section {
  position: relative;
  height: 600px;
  display: flex;
  align-items: center;
  overflow: hidden;
  color: var(--bg);

  .hero-bg {
    position: absolute;
    inset: 0;
    background-image: url("@/assets/img/hero.jpg");
    background-repeat: no-repeat;
    background-position: center;
  }

  .hero-bg--blur {
    background-size: cover;
    filter: blur(30px);
    transform: scale(1.1);
    z-index: 0;
  }

  .hero-bg--clear {
    background-size: contain;
    z-index: 1;
    pointer-events: none;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: var(--bg);
    opacity: 0.4;
    z-index: 2;
  }

  .hero-content {
    @include container();
    position: relative;
    z-index: 3;
    text-align: center;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(8px);
    border-radius: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;

    &.in-view {
      opacity: 1;
      transform: translateY(0);
    }

    h1 {
      font-size: 2.75rem;
      margin-bottom: 1rem;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      color: var(--text);
    }
    p {
      font-size: 1.15rem;
      margin-bottom: 2rem;
      color: var(--text);
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;

      .btn {
        padding: 0.75em 1.5em;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .btn-primary {
        background-color: var(--accent);
        color: var(--bg);
      }
      .btn-secondary {
        background-color: var(--bg);
        color: var(--text);
        border: 2px solid var(--accent);
        &:hover {
          background-color: var(--accent);
          color: var(--bg);
        }
      }
    }
  }
}

.advantages-section {
  margin: 4rem 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
  text-align: center;
  @include container();

  .advantage-item {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    padding: 2rem 1.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    }

    .icon {
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
      fill: var(--accent);
    }
    h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: var(--text);
    }
    p {
      font-size: 0.95rem;
      color: var(--secondary);
    }
  }
}

/* Тёмная тема для hero-content */
:deep([data-theme="dark"]) .hero-content {
  background: rgba(0, 0, 0, 0.6);
  color: var(--bg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);

  h1,
  p {
    color: var(--bg);
  }
}
.offers-section {
  padding: 4rem 0;

  &__title {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 2rem;
    color: var(--text);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 2rem;
  }

  .offer-card {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(8px);
    border-radius: 1rem;
    padding: 1.5rem;
    text-align: center;
    transition: transform .2s, box-shadow .2s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    }

    &__icon {
      width: 64px;
      height: 64px;
      margin-bottom: 1rem;
      fill: var(--accent);
      stroke: var(--accent);
    }

    &__title {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: var(--text);
    }

    &__text {
      font-size: 0.95rem;
      color: var(--secondary);
      line-height: 1.6;
    }
  }
}
</style>
