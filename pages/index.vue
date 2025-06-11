<template>
  <section class="hero-section" ref="heroRef">
    <!-- Background Image Slider -->
    <div class="hero-bg-slider">
      <div 
        v-for="(image, index) in heroImages" 
        :key="index"
        class="hero-bg-slide"
        :class="{ 'active': currentSlide === index }"
        :style="{ backgroundImage: `url(${image})` }"
      ></div>
    </div>
    <!-- Тонировочный оверлей -->
    <div class="hero-overlay"></div>

    <div class="container hero-content" :class="{ 'in-view': contentVisible }">
      <h1>
        <span class="company-name">КотлоЭнергоСнаб</span>
        <span class="slogan">«с нами тепло!»</span>
      </h1>
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
      <div class="offer-card">
        <svg class="offer-card__icon" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="30" width="60" height="30" rx="8" ry="8"/>
          <rect x="10" y="24" width="60" height="8" rx="4" ry="4"/>
          <rect x="4" y="36" width="6" height="18" rx="3"/>
          <rect x="70" y="36" width="6" height="18" rx="3"/>
        </svg>
        <h3 class="offer-card__title">Котлы водогрейные</h3>
        <p class="offer-card__text">
          Энергосберегающие водогрейные котлы для любых задач – от 0,1 до 100 МВт.
        </p>
      </div>

      <div class="offer-card">
        <svg class="offer-card__icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="4"/>
          <path d="M32 32 L32 8 M32 32 L56 32 M32 32 L32 56 M32 32 L8 32" stroke-width="4" stroke-linecap="round"/>
        </svg>
        <h3 class="offer-card__title">Вентиляторы и дымососы</h3>
        <p class="offer-card__text">
          Надёжные вентиляторы и дымососы для поддержания оптимальной тяги.
        </p>
      </div>

      <div class="offer-card">
        <svg class="offer-card__icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
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
import { ref, onMounted, onUnmounted } from "vue";

const heroRef = ref<HTMLElement | null>(null);
const contentVisible = ref(false);
const currentSlide = ref(0);

// Массив изображений для слайдера
const heroImages = [
  '/images/hero1.jpg',
  '/images/hero2.png',
  '/images/hero3.png',
  '/images/hero4.png'
];

// Функция для автоматической смены слайдов
let slideInterval: NodeJS.Timeout;

const startSlideShow = () => {
  slideInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % heroImages.length;
  }, 5000); // Смена каждые 5 секунд
};

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
  startSlideShow();
});

onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
});
</script>

<style lang="scss" scoped>
.hero-section {
  position: relative;
  height: 85vh;
  min-height: 500px;
  max-height: 700px;
  display: flex;
  align-items: center;
  overflow: hidden;
  color: var(--bg);
  padding: 0;

  .hero-bg-slider {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .hero-bg-slide {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity 2s ease-in-out, transform 2s ease-in-out;
    transform: scale(1.05);
    filter: blur(0);

    &.active {
      opacity: 1;
      transform: scale(1);
    }
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.6),
      rgba(0, 0, 0, 0.4)
    );
    z-index: 1;
  }

  .hero-content {
    @include container();
    position: relative;
    z-index: 2;
    text-align: center;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 2.5rem;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(12px);
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    word-break: break-word;
    color: #ffffff;

    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;

    &.in-view {
      opacity: 1;
      transform: translateY(0);
    }

    h1 {
      font-size: clamp(1.75rem, 5vw, 2.75rem);
      margin-bottom: 1.25rem;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      color: #ffffff;
      line-height: 1.3;

      .company-name {
        display: block;
        margin-bottom: 0.2em;
      }

      .slogan {
        display: block;
        font-size: 0.85em;
        font-weight: 600;
        opacity: 0.9;
      }
    }

    p {
      font-size: clamp(0.95rem, 3vw, 1.15rem);
      margin-bottom: 2rem;
      color: rgba(255, 255, 255, 0.95);
      line-height: 1.6;
      font-weight: 500;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      width: 100%;

      .btn {
        padding: 0.75em 1.5em;
        font-size: clamp(0.85rem, 2.5vw, 1rem);
        text-transform: uppercase;
        letter-spacing: 0.03em;
        white-space: normal;
        min-width: 200px;
        max-width: 100%;
        font-weight: 600;
        text-align: center;
        color: #ffffff;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
      }
    }
  }
}

// Стили для экранов до 992px
@include respond-to(lg) {
  .hero-section {
    min-height: 450px;
  }
  
  .hero-content {
    padding: 2rem;
    margin: 0 1rem;
    background: rgba(255, 255, 255, 0.9);
    
    .cta-buttons {
      gap: 0.75rem;
    }
  }
}

// Стили для экранов до 768px
@include respond-to(sm) {
  .hero-section {
    min-height: 400px;
  }

  .hero-content {
    padding: 1.5rem;
    margin: 0 auto;
    width: 90%;
    max-width: 400px;
    background: rgba(255, 255, 255, 0.2);
    
    h1 {
      .company-name {
        font-size: 1.8rem;
        margin-bottom: 0.15em;
      }

      .slogan {
        font-size: 1.2rem;
      }
    }
    
    p {
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .cta-buttons {
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      
      .btn {
        width: 85%;
        min-width: 180px;
        max-width: 280px;
        padding: 0.6em 1em;
        font-size: 0.9rem;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

// Стили для экранов до 576px
@include respond-to(xs) {
  .hero-section {
    min-height: 350px;
  }

  .hero-content {
    padding: 1.25rem;
    margin: 0 auto;
    width: 85%;
    max-width: 320px;
    border-radius: 0.75rem;
    background: rgba(255, 255, 255, 0.15);

    h1 {
      .company-name {
        font-size: 1.5rem;
        margin-bottom: 0.1em;
      }

      .slogan {
        font-size: 1.1rem;
      }
    }

    p {
      margin-bottom: 1.5rem;
      color: rgba(255, 255, 255, 0.85);
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
    }

    .cta-buttons {
      gap: 0.5rem;
      
      .btn {
        width: 80%;
        min-width: 160px;
        max-width: 240px;
        padding: 0.5em 0.75em;
        font-size: 0.85rem;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
      }
    }
  }
}

// Стили для очень маленьких экранов
@media (max-width: 360px) {
  .hero-section {
    min-height: 300px;
  }

  .hero-content {
    padding: 1rem;
    margin: 0 auto;
    width: 80%;
    max-width: 280px;
    background: rgba(255, 255, 255, 0.12);

    h1 {
      .company-name {
        font-size: 1.25rem;
        margin-bottom: 0.1em;
      }

      .slogan {
        font-size: 1rem;
      }
    }

    p {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.8);
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }

    .cta-buttons {
      gap: 0.4rem;
      
      .btn {
        width: 75%;
        min-width: 140px;
        max-width: 200px;
        font-size: 0.8rem;
        padding: 0.4em 0.6em;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      }
    }
  }
}

.advantages-section {
  margin: 4rem auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
  text-align: center;
  @include container();
  max-width: 1200px;
  width: 100%;
  padding: 0 1rem;

  @include respond-to(sm) {
    margin: 3rem auto;
    width: 90%;
    max-width: 500px;
    gap: 1.5rem;
  }

  @include respond-to(xs) {
    margin: 2rem auto;
    width: 85%;
    max-width: 400px;
    gap: 1rem;
  }

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
