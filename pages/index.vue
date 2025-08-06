<template>
  <div class="home">
    <!-- Hero Section -->
    <client-only>
      <section
        class="hero"
        :class="{ 'hero--mobile': $device.isMobile }"
        v-scroll-reveal="'fade-in'"
      >
        <div
          v-for="(img, idx) in heroImages"
          :key="img"
          class="hero__bg"
          :class="{ active: idx === currentHero }"
        >
          <NuxtImg
            :src="img"
            :alt="`Главный баннер ${idx + 1}`"
            :placeholder="[67, 58, 45, 10]"
            sizes="400px xxs:900px md:1200px"
            format="webp"
            class="hero__bg-image"
            @error="handleImageError"
            fallback="/images/placeholders/placeholder.png"
          />
          <div class="hero__bg-overlay"></div>
        </div>
        <div class="container">
          <div class="hero__content">
            <h1 class="hero__title">
              <span
                >Котельный завод «КЭС» — Проектирование, производство, монтаж,
                пуско-наладка котлов и котельного оборудования</span
              >
            </h1>
            <div class="hero__title__bt">
              <NuxtLink to="/about" class="btn btn-primary"
                >Подробнее о заводе</NuxtLink
              >
              <NuxtLink to="/catalog" class="btn btn-primary"
                >Перейти в Каталог</NuxtLink
              >
            </div>
          </div>
        </div>
      </section>
    </client-only>
    <!-- Catalog Section -->
    <section class="catalog" v-scroll-reveal="'fade-in-up'">
      <div class="container">
        <h2 class="section-title">Каталог продукции</h2>
        <client-only>
          <div :class="['grid', $device.isMobile ? 'grid-1' : 'grid-3']">
            <div
              class="catalog-card"
              v-for="category in mainCategories"
              :key="category.slug"
              v-scroll-reveal="'zoom-in'"
            >
              <NuxtLink :to="`/catalog/${category.slug}`">
                <img
                  :src="
                    Array.isArray(category.images) && category.images[0]
                      ? category.images[0]
                      : '/images/placeholders/placeholder.png'
                  "
                  :alt="`${category.title} - котельное оборудование`"
                />
                <h3>{{ category.title }}</h3>
                <p v-if="!$device.isMobile">{{ category.description }}</p>
                <NuxtLink
                  :to="`/catalog/${category.slug}`"
                  class="btn btn-primary"
                  >Подробнее</NuxtLink
                >
              </NuxtLink>
            </div>
          </div>
        </client-only>
        <div class="text-center">
          <NuxtLink to="/catalog" class="btn btn-primary"
            >Все категории</NuxtLink
          >
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about" v-scroll-reveal="'slide-in-left'">
      <div class="container">
        <div class="about__content">
          <div class="about__text">
            <h2>О заводе котельного оборудования</h2>
            <ul class="about__list">
              <li>
                Наше котельное оборудование успешно работает практически во всех
                регионах России от Крыма до Камчатки.
              </li>
              <li>
                Разработки проектного отдела завода имеют патенты. Котельное
                оборудование производится по типовым проектам и по техническим
                заданиям.
              </li>
              <li>
                Вся продукция котельного завода сертифицирована и соответствует
                ГОСТ.
              </li>
              <li>
                Аттестованная технология сварки позволяет выпускать поднадзорную
                продукцию для котельных.
              </li>
              <li>
                Выполняем разделы проектов теплоснабжения для прохождения
                экспертизы и составления проектно-сметной документации. Состоим
                в реестре членов СРО для выполнения проектных и строительных
                работ.
              </li>
              <li>
                Выполняем инженерно-консультационные услуги по эксплуатации и
                наладке котельных установок.
              </li>
              <li>
                Котельный завод производит пуско-наладку котельных и котельного
                оборудования.
              </li>
            </ul>
          </div>
          <div class="about__media" v-scroll-reveal="'slide-in-right'">
            <div class="factory-slider">
              <div
                v-for="(img, idx) in factoryImages"
                :key="img"
                class="factory-slide"
                :class="{ active: idx === currentFactorySlide }"
              >
                <NuxtImg
                  :placeholder="[67, 58, 45, 10]"
                  sizes="400px xxs:900px md:1200px"
                  format="webp"
                  :src="img"
                  :alt="`Фото завода ${idx + 1}`"
                />
              </div>
              <div class="factory-slider__caption">
                <h3>Наш завод</h3>
                <p>Современное производство котельного оборудования</p>
              </div>
              <div class="factory-slider__controls">
                <button class="slider-control prev" @click="prevSlide">
                  <BackIcon class="arrow-icon" />
                </button>
                <button class="slider-control next" @click="nextSlide">
                  <NextIcon class="arrow-icon" />
                </button>
              </div>
              <div class="factory-slider__dots">
                <button
                  v-for="(_, idx) in factoryImages"
                  :key="idx"
                  class="dot"
                  :class="{ active: idx === currentFactorySlide }"
                  @click="currentFactorySlide = idx"
                ></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="services" v-scroll-reveal="'fade-in-up'">
      <div class="container">
        <h2 class="section-title">Услуги завода</h2>
        <div class="grid grid-4">
          <NuxtLink
            :to="`/contact?service=${encodeURIComponent(
              service.title.replace(/<br>/g, ' ')
            )}`"
            class="service-card"
            v-for="(service, idx) in services"
            :key="service.title"
            v-scroll-reveal="service.animation"
          >
            <NuxtImg
              :placeholder="[67, 58, 45, 10]"
              sizes="400px xxs:900px md:1200px"
              format="webp"
              :src="service.img"
              :alt="service.title"
            />
            <h3 v-html="service.title"></h3>
            <div class="service-card__arrow">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Call to Action Section -->
    <section class="cta-section" v-scroll-reveal="'fade-in-up'">
      <div class="container">
        <div class="cta-card">
          <div class="cta-content">
            <div class="cta-text">
              <h3>Дополнительные услуги!</h3>
              <p>
                Наши специалисты подберут оптимальное решение для вашего объекта
                и предложат выгодную цену. Получите бесплатную консультацию и
                расчет стоимости.
              </p>
            </div>
            <div class="cta-actions">
              <button @click="ModalCall" class="btn btn-primary btn-large">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Связаться с нами
              </button>
              <NuxtLink to="/contact" class="btn btn-outline btn-large">
                Заказать звонок
              </NuxtLink>
            </div>
          </div>
          <div class="cta-features">
            <div class="feature-item">
              <div class="feature-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <span>Бесплатная консультация</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <span>Индивидуальный подход</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <span>Быстрый расчет стоимости</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Calculator Section -->
    <section class="calculator" v-scroll-reveal="'fade-in-up'">
      <div class="container">
        <h2 class="section-title">
          <TypeWriter />
          для вашего объекта
        </h2>
        <div class="calculator__form">
          <div class="form-group">
            <label>Тип здания</label>
            <div class="input-with-select">
              <select v-model="typeBuilding">
                <option value="">Выберите тип здания</option>
                <option
                  v-for="building in buildingTypes"
                  :key="building"
                  :value="building"
                >
                  {{ building }}
                </option>
              </select>
              <input
                type="text"
                v-model="typeBuilding"
                placeholder="Или введите свой вариант"
                class="manual-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Вид топлива</label>
            <div class="input-with-select">
              <select v-model="fuelType">
                <option value="">Выберите вид топлива</option>
                <option v-for="fuel in fuelTypes" :key="fuel" :value="fuel">
                  {{ fuel }}
                </option>
              </select>
              <input
                type="text"
                v-model="fuelType"
                placeholder="Или введите свой вариант"
                class="manual-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Тип мощности</label>
            <div class="input-with-select">
              <select v-model="powerType">
                <option value="">Выберите тип мощности</option>
                <option v-for="power in powerTypes" :key="power" :value="power">
                  {{ power }}
                </option>
              </select>
              <input
                type="text"
                v-model="powerType"
                placeholder="Или введите свой вариант"
                class="manual-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Регион</label>
            <div class="region-select">
              <input
                type="text"
                v-model="regionSearch"
                placeholder="Поиск региона..."
                class="region-search"
              />
              <div
                class="region-dropdown"
                v-if="regionSearch && filteredRegions.length"
              >
                <div
                  v-for="region in filteredRegions"
                  :key="region"
                  class="region-option"
                  @click="selectRegion(region)"
                >
                  {{ region }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-group phone-group">
            <label>Телефон для связи</label>
            <div class="phone-input">
              <span class="phone-prefix">+7</span>
              <input
                type="tel"
                v-model="phoneNumber"
                placeholder="(___) ___-__-__"
                @input="formatPhoneNumber"
                class="phone-field"
              />
            </div>
          </div>

          <button class="btn btn-primary" @click="calculate">Рассчитать</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useModalStore } from "~/stores/modal";
import BackIcon from "~/components/icons/back.vue";
import NextIcon from "~/components/icons/next.vue";
import TypeWriter from "~/components/TypeWriter.vue";
import { contacts } from "~/data/contacts";
// SEO Meta Tags
useHead({
  title: "КотлоЭнергоСнаб — Котельный завод КЭС Барнаул",
  meta: [
    {
      name: "description",
      content:
        "КотлоЭнергоСнаб — ведущий производитель котлов и котельного оборудования в Барнауле. Производство, монтаж, сервис, проектирование, пуско-наладка.",
    },
    {
      name: "keywords",
      content:
        "КотлоЭнергоСнаб, котельный завод, котельное оборудование, котлы, модульные котельные, Барнаул, производство котлов, монтаж, пуско-наладка",
    },
    {
      name: "author",
      content: "КотлоЭнергоСнаб",
    },
    {
      property: "og:site_name",
      content: "КотлоЭнергоСнаб",
    },
    {
      property: "og:title",
      content: "КотлоЭнергоСнаб — Котельный завод КЭС Барнаул",
    },
    {
      property: "og:description",
      content:
        "КотлоЭнергоСнаб — ведущий производитель котлов и котельного оборудования в Барнауле. Производство, монтаж, сервис.",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:url",
      content: "https://kes-sib.ru/",
    },
    {
      property: "og:image",
      content: "/images/hero1.jpg",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: "КотлоЭнергоСнаб — Котельный завод КЭС Барнаул",
    },
    {
      name: "twitter:description",
      content:
        "КотлоЭнергоСнаб — ведущий производитель котлов и котельного оборудования в Барнауле.",
    },
    {
      name: "robots",
      content: "index, follow",
    },
  ],
  link: [
    {
      rel: "icon",
      href: "/favicon.ico",
      type: "image/x-icon",
    },
    {
      rel: "canonical",
      href: "https://kes-sib.ru/",
    },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "http://schema.org",
        "@type": "Organization",
        name: "КотлоЭнергоСнаб",
        url: "https://kes-sib.ru/",
        logo: "https://kes-sib.ru/favicon.ico",
      }),
    },
  ],
});

const { $device } = useNuxtApp();
// Получаем реальные категории для каталога на главной
interface Category {
  title: string;
  slug: string;
  images: string[];
  description: string;
}
const mainCategories = ref<Category[]>([]);
const { data: fetchedCategories, error: fetchError } = await useFetch<{
  categories: Category[];
}>("/api/categories");
if (
  fetchedCategories.value &&
  Array.isArray(fetchedCategories.value.categories)
) {
  mainCategories.value = fetchedCategories.value.categories.slice(0, 3);
} else if (fetchError.value) {
  console.error("Error loading categories:", fetchError.value);
}

const typeBuilding = ref("");
const fuelType = ref("");
const powerType = ref("");
const phoneNumber = ref("");

const regions = [
  "Алтайский край",
  "Амурская область",
  "Архангельская область",
  "Астраханская область",
  "Белгородская область",
  "Брянская область",
  "Владимирская область",
  "Волгоградская область",
  "Вологодская область",
  "Воронежская область",
  "Еврейская автономная область",
  "Забайкальский край",
  "Ивановская область",
  "Иркутская область",
  "Кабардино-Балкарская Республика",
  "Калининградская область",
  "Калужская область",
  "Камчатский край",
  "Карачаево-Черкесская Республика",
  "Кемеровская область",
  "Кировская область",
  "Костромская область",
  "Краснодарский край",
  "Красноярский край",
  "Курганская область",
  "Курская область",
  "Ленинградская область",
  "Липецкая область",
  "Магаданская область",
  "Москва",
  "Московская область",
  "Мурманская область",
  "Ненецкий автономный округ",
  "Нижегородская область",
  "Новгородская область",
  "Новосибирская область",
  "Омская область",
  "Оренбургская область",
  "Орловская область",
  "Пензенская область",
  "Пермский край",
  "Приморский край",
  "Псковская область",
  "Республика Адыгея",
  "Республика Алтай",
  "Республика Башкортостан",
  "Республика Бурятия",
  "Республика Дагестан",
  "Республика Ингушетия",
  "Республика Калмыкия",
  "Республика Карелия",
  "Республика Коми",
  "Республика Крым",
  "Республика Марий Эл",
  "Республика Мордовия",
  "Республика Саха (Якутия)",
  "Республика Северная Осетия - Алания",
  "Республика Татарстан",
  "Республика Тыва",
  "Республика Хакасия",
  "Ростовская область",
  "Рязанская область",
  "Самарская область",
  "Санкт-Петербург",
  "Саратовская область",
  "Сахалинская область",
  "Свердловская область",
  "Смоленская область",
  "Ставропольский край",
  "Тамбовская область",
  "Тверская область",
  "Томская область",
  "Тульская область",
  "Тюменская область",
  "Удмуртская Республика",
  "Ульяновская область",
  "Хабаровский край",
  "Ханты-Мансийский автономный округ - Югра",
  "Челябинская область",
  "Чеченская Республика",
  "Чувашская Республика",
  "Чукотский автономный округ",
  "Ямало-Ненецкий автономный округ",
  "Ярославская область",
];

const buildingTypes = [
  "Административные здания",
  "Бани",
  "Больницы",
  "Гаражи",
  "Гостиницы",
  "Детские сады",
  "Жилые постройки 1930-1958 г.г",
  "Жилые постройки после 1958 г.",
  "Кафе рестораны",
  "Кинотеатр",
  "Клубы",
  "Магазины",
  "Пожарные Депо",
  "Поликлиники",
  "Школы",
];

const fuelTypes = ["Газ", "Твердое топливо", "Жидкое топливо", "Электричество"];

const powerTypes = ["Паровая", "Водогрейная"];

const selectRegion = (region: string) => {
  regionSearch.value = region;
};

const formatPhoneNumber = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, "");

  // Форматирование номера: 945 494 34 43
  if (value.length > 0) {
    if (value.length <= 3) {
      value = value;
    } else if (value.length <= 6) {
      value = value.slice(0, 3) + " " + value.slice(3);
    } else if (value.length <= 8) {
      value = value.slice(0, 3) + " " + value.slice(3, 6) + " " + value.slice(6);
    } else {
      value = value.slice(0, 3) + " " + value.slice(3, 6) + " " + value.slice(6, 8) + " " + value.slice(8);
    }
  }

  phoneNumber.value = value;
};
const modalStore = useModalStore();
async function calculate() {
  // Валидация телефона: минимум 10 цифр (без кода страны)
  const phoneDigits = phoneNumber.value.replace(/\D/g, "");
  if (!phoneDigits || phoneDigits.length < 10) {
    modalStore.showError("Пожалуйста, введите корректный номер телефона.");
    return;
  }
  const payload = {
    text: `📩 Новая заявка:
- Телефон: ${phoneNumber.value}
- Регион: ${regionSearch.value}
- Тип здания: ${typeBuilding.value}
- Вид топлива: ${fuelType.value}
- Тип мощности: ${powerType.value}`,
  };

  try {
    const res = await $fetch("/api/contact", {
      method: "POST",
      body: payload,
    });
    modalStore.showSuccess("Обращение успешно отправлено!");
    phoneNumber.value = "";
    regionSearch.value = "";
    typeBuilding.value = "";
    fuelType.value = "";
    powerType.value = "";
  } catch (err) {
    console.error("Ошибка отправки:", err);
    modalStore.showError(`Ошибка отправки: ${err}`);
  }
}

const regionSearch = ref("");
const filteredRegions = computed(() => {
  if (!regionSearch.value) return regions;
  return regions.filter((region) =>
    region.toLowerCase().includes(regionSearch.value.toLowerCase())
  );
});
const ModalCall = () => {
  modalStore.openModal(
    "Свзяаться с нами",
    `Наши номера для связи: 
    ${contacts.phone[0]}, 
    ${contacts.phone[1]}`,
    "Я позвоню"
  );
};
const heroImages = [
  "/images/hero1.png",
  "/images/hero2.png",
  "/images/hero3.png",
  "/images/hero4.png",
];
const currentHero = ref(0);
let intervalId: number | undefined;

const factoryImages = [
  "/images/hero1x.png",
  "/images/hero2x.png",
  "/images/hero3x.png",
  "/images/hero4x.png",
];
const currentFactorySlide = ref(0);
let factoryIntervalId: number | undefined;

const prevSlide = () => {
  currentFactorySlide.value =
    (currentFactorySlide.value - 1 + factoryImages.length) %
    factoryImages.length;
};

const nextSlide = () => {
  currentFactorySlide.value =
    (currentFactorySlide.value + 1) % factoryImages.length;
};

// Pause auto-sliding when user interacts with controls
const pauseAutoSlide = () => {
  if (factoryIntervalId) {
    clearInterval(factoryIntervalId);
    factoryIntervalId = undefined;
  }
};

const resumeAutoSlide = () => {
  if (!factoryIntervalId) {
    factoryIntervalId = window.setInterval(() => {
      currentFactorySlide.value =
        (currentFactorySlide.value + 1) % factoryImages.length;
    }, 4000);
  }
};

onMounted(() => {
  // Hero slider interval
  intervalId = window.setInterval(() => {
    currentHero.value = (currentHero.value + 1) % heroImages.length;
  }, 5000);

  // Factory slider interval
  resumeAutoSlide();
});

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId);
  if (factoryIntervalId) clearInterval(factoryIntervalId);
});

function handleImageError(e: Event | string) {
  if (typeof e === "string") {
    // NuxtImg может передавать строку с ошибкой
    console.error("Image error:", e);
    return;
  }

  const img = e.target as HTMLImageElement;
  if (img) {
    img.src = "/images/placeholders/placeholder.png";
  }
}

const services = [
  {
    img: "/images/services/installation.png",
    title: "Монтаж | Демонтаж <br>котлов",
    animation: "slide-in-left",
  },
  {
    img: "/images/services/design.png",
    title: "Проектирование котельной",
    animation: "fade-in-up",
  },
  {
    img: "/images/services/startup.png",
    title: "Пуско-наладка котельной",
    animation: "zoom-in",
  },
  {
    img: "/images/services/turnkey.png",
    title: "Котельная под ключ",
    animation: "slide-in-right",
  },
];
</script>

<style lang="scss" scoped>
.hero {
  position: relative;
  overflow: hidden;
  color: #fff;
  padding: 100px 0;
  text-align: center;
}
.hero__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0;
  transition: opacity 1.5s;
  overflow: hidden;
}

.hero__bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  position: absolute;
  top: 0;
  left: 0;
}

.hero__bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5));
  z-index: 1;
}
.hero__bg.active {
  opacity: 1;
}
.hero__content {
  position: relative;
  z-index: 2;
}

.hero__title {
  font-size: 2.5rem;
  margin-bottom: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
}
.hero__title__bt {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  gap: 24px;
  flex-direction: row;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
}

.section-title {
  text-align: center;
  font-size: 2rem;
}

.catalog {
  padding: 60px 0 80px 0;
}

.catalog-card {
  background: #fff;
  border-radius: 8px;
  margin-top: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px 20px 20px 20px;
  text-align: center;
  position: relative;
  padding-top: 80px;
  overflow: visible;
  width: 100%;
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
}
.catalog-card img {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 8px;
  z-index: 2;
  margin-bottom: 0;
}
.catalog-card h3 {
  margin-top: 80px;
  margin-bottom: 15px;
}

.catalog-card p {
  margin-bottom: 20px;
  color: #666;
}

.text-center {
  text-align: center;
  margin-top: 40px;
}

.about {
  padding: 80px 0;
  background: #f5f5f5;
}

.about__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.about__text {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.about__text h2 {
  font-size: 2rem;
  margin-bottom: 24px;
}

.about__list {
  list-style: disc;
  padding-left: 20px;
  flex-grow: 1;
}

.about__list li {
  margin-bottom: 16px;
  line-height: 1.5;
}

.about__media {
  height: 100%;
}

.factory-slider {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.factory-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}

.factory-slide.active {
  opacity: 1;
}

.factory-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.factory-slider__caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  text-align: center;
  z-index: 2;
}

.factory-slider__caption h3 {
  margin: 0 0 12px 0;
  font-size: 2rem;
  font-weight: 600;
}

.factory-slider__caption p {
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.9;
}

.factory-slider__controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 2;
}

.slider-control {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .arrow-icon {
    width: 24px;
    height: 24px;
  }
}

.factory-slider__dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 2;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &.active {
    background: white;
    transform: scale(1.2);
  }
}

.services {
  padding: 80px 0;
}

.service-card {
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(220, 53, 69, 0.1);
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;
  width: 100%;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.service-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #dc3545, #c82333, #a71e2a);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.service-card:hover,
.service-card:focus {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(220, 53, 69, 0.15);
  border-color: rgba(220, 53, 69, 0.2);
  text-decoration: none;
  color: inherit;
}

.service-card:hover::before,
.service-card:focus::before {
  transform: scaleX(1);
}

.service-card:active {
  transform: translateY(-4px);
}

.service-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.service-card:hover img,
.service-card:focus img {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(220, 53, 69, 0.2);
}

.service-card h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #1a1a1a;
  line-height: 1.3;
  position: relative;
}

.service-card h3::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #dc3545, #c82333);
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.service-card:hover h3::after,
.service-card:focus h3::after {
  opacity: 1;
}

.service-card__arrow {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc3545;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.service-card:hover .service-card__arrow,
.service-card:focus .service-card__arrow {
  background: #dc3545;
  color: white;
  transform: translateX(4px);
  opacity: 1;
}

.cta-section {
  padding: 20px 0 60px 0;
}

.cta-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.cta-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #dc3545, #c82333, #a71e2a);
}

.cta-content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 32px;
  align-items: center;
  margin-bottom: 32px;
}

.cta-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #dc3545, #c82333);
  border-radius: 50%;
  color: white;
  flex-shrink: 0;
}

.cta-text h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #1a1a1a;
  line-height: 1.2;
}

.cta-text p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #666;
  margin: 0;
  max-width: 500px;
}

.cta-actions {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
}

.btn-large {
  padding: 16px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.btn-outline {
  background: transparent;
  color: #dc3545;
  border-color: #dc3545;
}

.btn-outline:hover {
  background: #dc3545;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-primary.btn-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.cta-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  padding-top: 32px;
  border-top: 1px solid #e9ecef;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #dc3545;
  border-radius: 8px;
  color: white;
  flex-shrink: 0;
}

.feature-item span {
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.calculator {
  padding: 80px 0;
  background: #f5f5f5;
}

.calculator__form {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.input-with-select {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-with-select select,
.input-with-select input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.input-with-select select:focus,
.input-with-select input:focus {
  outline: none;
}

.manual-input {
  margin-top: 4px;
}

.region-select {
  position: relative;
}

.region-search {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.region-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.region-option {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.region-option:hover {
  background-color: #f5f5f5;
}

.phone-group {
  margin-top: 20px;
}

.phone-input {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 12px;
  transition: border-color 0.3s;
}

.phone-input:focus-within {
  border-color: #007bff;
}

.phone-prefix {
  color: #666;
  font-size: 16px;
}

.phone-field {
  border: none;
  padding: 8px 0;
  font-size: 16px;
  width: 100%;
}

.phone-field:focus {
  outline: none;
}

.btn-primary {
  grid-column: 1 / -1;
  padding: 14px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  border: none;
  min-width: 250px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  background: var(--primary-color);
}

.btn-primary:hover {
  background: var(--primary-hover);
}

@media (max-width: 992px) {
  .about__content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .factory-slider {
    min-height: 400px;
  }

  .about__text h2,
  .factory-slider__caption h3 {
    font-size: 1.8rem;
  }

  .factory-slider__caption p {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .about__content {
    gap: 20px;
  }

  .factory-slider {
    min-height: 300px;
  }

  .about__text h2,
  .factory-slider__caption h3 {
    font-size: 1.4rem;
    margin-bottom: 16px;
  }

  .about__list li {
    font-size: 0.9rem;
    margin-bottom: 12px;
  }

  .factory-slider__caption {
    padding: 20px;
  }

  .factory-slider__caption p {
    font-size: 1rem;
  }

  .slider-control {
    width: 40px;
    height: 40px;

    .arrow-icon {
      width: 20px;
      height: 20px;
    }
  }

  .dot {
    width: 10px;
    height: 10px;
  }
}

@media (max-width: 992px) {
  .cta-content {
    grid-template-columns: 1fr;
    gap: 24px;
    text-align: center;
  }

  .cta-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .cta-features {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .service-card {
    padding: 24px 20px;
  }

  .service-card h3 {
    font-size: 1.2rem;
  }

  .service-card__arrow {
    width: 28px;
    height: 28px;
    bottom: 12px;
    right: 12px;
  }
}

@media (max-width: 768px) {
  .cta-card {
    padding: 32px 24px;
  }

  .cta-text h3 {
    font-size: 1.6rem;
  }

  .cta-text p {
    font-size: 1rem;
  }

  .cta-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-large {
    width: 100%;
    justify-content: center;
  }

  .cta-features {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .feature-item {
    padding: 12px;
  }

  .cta-icon {
    width: 60px;
    height: 60px;
  }

  .service-card {
    padding: 20px 16px;
    margin-bottom: 20px;
  }

  .service-card img {
    height: 160px;
    margin-bottom: 20px;
  }

  .service-card h3 {
    font-size: 1.1rem;
    margin-bottom: 12px;
  }

  .service-card:hover {
    transform: translateY(-4px);
  }

  .service-card__arrow {
    width: 24px;
    height: 24px;
    bottom: 10px;
    right: 10px;
  }
}

// Grid стили для совместимости
.grid-1 {
  grid-template-columns: 1fr;
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 992px) {
  .grid-4 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-3,
  .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .grid-2,
  .grid-3,
  .grid-4 {
    grid-template-columns: 1fr;
  }
}
</style>
