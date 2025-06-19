<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero" :class="{ 'hero--mobile': $device.isMobile }">
      <div
        v-for="(img, idx) in heroImages"
        :key="img"
        class="hero__bg"
        :class="{ active: idx === currentHero }"
        :style="{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url('${img}')`
        }"
      />
      <div class="container">
        <div class="hero__content">
          <h1 class="hero__title">
            <span >Котельный завод «КЭС» — Проектирование, производство, монтаж, пуско-наладка котлов и котельного оборудования</span>
          </h1>
          <div class="hero__title__btn">
            <NuxtLink to="/about" class="btn btn-primary">Подробнее о заводе</NuxtLink>
            <NuxtLink to="/catalog" class="btn btn-primary">Перейти в Каталог</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Catalog Section -->
    <section class="catalog">
      <div class="container">
        <h2 class="section-title">Каталог продукции</h2>
        <div :class="['grid', $device.isMobile ? 'grid-1' : 'grid-3']">
          <div class="catalog-card" v-for="category in mainCategories" :key="category.slug">
            <img 
              :src="category.images[0]" 
              :alt="category.title"
              @error="handleImageError"
            />
            <h3>{{ category.title }}</h3>
            <p v-if="!$device.isMobile">{{ category.description }}</p>
            <NuxtLink :to="`/catalog/${category.slug}`" class="btn btn-primary">Подробнее</NuxtLink>
          </div>
        </div>
        <div class="text-center">
          <NuxtLink to="/catalog" class="btn btn-primary">Все категории</NuxtLink>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about">
      <div class="container">
        <div class="about__content">
          <div class="about__text">
            <h2>О заводе</h2>
            <ul class="about__list">
              <li>Наше оборудование успешно работает практически во всех регионах России от Крыма до Камчатки, на территории соседних государств Казахстана, Белоруссии, Монголии, Литвы, Узбекистана.</li>
              <li>Разработки проектного отдела завода имеют патенты. Оборудование производится по типовым проектам и по техническим заданиям.</li>
              <li>Вся продукция завода сертифицирована.</li>
              <li>Аттестованная технология сварки позволяет выпускать поднадзорную продукцию.</li>
              <li>Выполняем разделы проектов теплоснабжения для прохождения экспертизы и составления проектно-сметной документации. Состоим в реестре членов СРО для выполнения проектных и строительных работы.</li>
              <li>Выполняем инженерно-консультационные услуги по эксплуатации и наладке котельных.</li>
              <li>Завод производит пуско-наладку котельных.</li>
            </ul>
          </div>
          <div class="about__media">
            <div class="factory-slider">
              <div 
                v-for="(img, idx) in factoryImages" 
                :key="img"
                class="factory-slide"
                :class="{ active: idx === currentFactorySlide }"
              >
                <img :src="img" :alt="`Фото завода ${idx + 1}`" />
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
    <section class="services">
      <div class="container">
        <h2 class="section-title">Услуги завода</h2>
        <div class="grid grid-4">
          <div class="service-card">
            <img src="/images/services/installation.jpg" alt="Монтаж котельной" />
            <h3>Монтаж | Демонтаж <br>котлов</h3>
          </div>
          <div class="service-card">
            <img src="/images/services/design.jpg" alt="Проектирование котельной" />
            <h3>Проектирование котельной</h3>
          </div>
          <div class="service-card">
            <img src="/images/services/startup.jpg" alt="Пуско-наладка котельной" />
            <h3>Пуско-наладка котельной</h3>
          </div>
          <div class="service-card">
            <img src="/images/services/turnkey.jpg" alt="Котельная под ключ" />
            <h3>Котельная под ключ</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- Calculator Section -->
    <section class="calculator">
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
                <option v-for="building in buildingTypes" :key="building" :value="building">
                  {{ building }}
                </option>
              </select>
              <input 
                type="text" 
                v-model="typeBuilding"
                placeholder="Или введите свой вариант"
                class="manual-input"
              >
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
              >
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
              >
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
              >
              <div class="region-dropdown" v-if="regionSearch && filteredRegions.length">
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
              >
            </div>
          </div>

          <button class="btn btn-primary" @click="calculate">Рассчитать</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useNuxtApp } from '#app'
import { useModalStore } from '~/stores/modal'
import BackIcon from '~/components/icons/back.vue'
import NextIcon from '~/components/icons/next.vue'
import TypeWriter from '~/components/TypeWriter.vue'
const { $device } = useNuxtApp()
// Получаем реальные категории для каталога на главной
interface Category {
  title: string;
  slug: string;
  images: string[];
  description: string;
}
const mainCategories = ref<Category[]>([]);
const { data: fetchedCategories, error: fetchError } = await useFetch<Category[]>('/api/categories');
if (fetchedCategories.value) {
  mainCategories.value = fetchedCategories.value.slice(0, 3);
} else if (fetchError.value) {
  console.error('Error loading categories:', fetchError.value);
}

const typeBuilding = ref('')
const fuelType = ref('')
const powerType = ref('')
const phoneNumber = ref('')

const regions = [
  'Алтайский край',
  'Амурская область',
  'Архангельская область',
  'Астраханская область',
  'Белгородская область',
  'Брянская область',
  'Владимирская область',
  'Волгоградская область',
  'Вологодская область',
  'Воронежская область',
  'Еврейская автономная область',
  'Забайкальский край',
  'Ивановская область',
  'Иркутская область',
  'Кабардино-Балкарская Республика',
  'Калининградская область',
  'Калужская область',
  'Камчатский край',
  'Карачаево-Черкесская Республика',
  'Кемеровская область',
  'Кировская область',
  'Костромская область',
  'Краснодарский край',
  'Красноярский край',
  'Курганская область',
  'Курская область',
  'Ленинградская область',
  'Липецкая область',
  'Магаданская область',
  'Москва',
  'Московская область',
  'Мурманская область',
  'Ненецкий автономный округ',
  'Нижегородская область',
  'Новгородская область',
  'Новосибирская область',
  'Омская область',
  'Оренбургская область',
  'Орловская область',
  'Пензенская область',
  'Пермский край',
  'Приморский край',
  'Псковская область',
  'Республика Адыгея',
  'Республика Алтай',
  'Республика Башкортостан',
  'Республика Бурятия',
  'Республика Дагестан',
  'Республика Ингушетия',
  'Республика Калмыкия',
  'Республика Карелия',
  'Республика Коми',
  'Республика Крым',
  'Республика Марий Эл',
  'Республика Мордовия',
  'Республика Саха (Якутия)',
  'Республика Северная Осетия - Алания',
  'Республика Татарстан',
  'Республика Тыва',
  'Республика Хакасия',
  'Ростовская область',
  'Рязанская область',
  'Самарская область',
  'Санкт-Петербург',
  'Саратовская область',
  'Сахалинская область',
  'Свердловская область',
  'Смоленская область',
  'Ставропольский край',
  'Тамбовская область',
  'Тверская область',
  'Томская область',
  'Тульская область',
  'Тюменская область',
  'Удмуртская Республика',
  'Ульяновская область',
  'Хабаровский край',
  'Ханты-Мансийский автономный округ - Югра',
  'Челябинская область',
  'Чеченская Республика',
  'Чувашская Республика',
  'Чукотский автономный округ',
  'Ямало-Ненецкий автономный округ',
  'Ярославская область'
]

const buildingTypes = [
  'Административные здания',
  'Бани',
  'Больницы',
  'Гаражи',
  'Гостиницы',
  'Детские сады',
  'Жилые постройки 1930-1958 г.г',
  'Жилые постройки после 1958 г.',
  'Кафе рестораны',
  'Кинотеатр',
  'Клубы',
  'Магазины',
  'Пожарные Депо',
  'Поликлиники',
  'Школы'
]

const fuelTypes = [
  'Газ',
  'Твердое топливо',
  'Жидкое топливо',
  'Электричество'
]

const powerTypes = [
  'Паровая',
  'Водогрейная'
]

const selectRegion = (region: string) => {
  regionSearch.value = region
}

const formatPhoneNumber = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  
  if (value.length > 0) {
    value = value.match(new RegExp('.{1,3}', 'g'))?.join(' ') || value
  }
  
  phoneNumber.value = value
}
const modalStore = useModalStore();
async function calculate() {
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
    modalStore.showSuccess("Обращение успешно отправлено!")
    phoneNumber.value = '';
    regionSearch.value = '';
    typeBuilding.value = '';
    fuelType.value = '';
    powerType.value = '';
  } catch (err) {
    console.error("Ошибка отправки:", err);
    modalStore.showError(`Ошибка отправки: ${err}`)
  }
}

const regionSearch = ref('')
const filteredRegions = computed(() => {
  if (!regionSearch.value) return regions
  return regions.filter(region => 
    region.toLowerCase().includes(regionSearch.value.toLowerCase())
  )
})

const heroImages = [
  '/images/hero1.jpg',
  '/images/hero2.png',
  '/images/hero3.png',
  '/images/hero4.png',
]
const currentHero = ref(0)
let intervalId: number | undefined

const factoryImages = [
  '/images/hero1.jpg',
  '/images/hero2.png',
  '/images/hero3.png',
  '/images/hero4.png',
]
const currentFactorySlide = ref(0)
let factoryIntervalId: number | undefined

const prevSlide = () => {
  currentFactorySlide.value = (currentFactorySlide.value - 1 + factoryImages.length) % factoryImages.length
}

const nextSlide = () => {
  currentFactorySlide.value = (currentFactorySlide.value + 1) % factoryImages.length
}

// Pause auto-sliding when user interacts with controls
const pauseAutoSlide = () => {
  if (factoryIntervalId) {
    clearInterval(factoryIntervalId)
    factoryIntervalId = undefined
  }
}

const resumeAutoSlide = () => {
  if (!factoryIntervalId) {
    factoryIntervalId = window.setInterval(() => {
      currentFactorySlide.value = (currentFactorySlide.value + 1) % factoryImages.length
    }, 4000)
  }
}

onMounted(() => {
  // Hero slider interval
  intervalId = window.setInterval(() => {
    currentHero.value = (currentHero.value + 1) % heroImages.length
  }, 5000)

  // Factory slider interval
  resumeAutoSlide()
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
  if (factoryIntervalId) clearInterval(factoryIntervalId)
})

function handleImageError(e: Event) {
  const img = e.target as HTMLImageElement
  if (img) {
    img.src = '/images/placeholders/category-placeholder.png'
  }
}
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
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.5s;
}
.hero__bg.active {
  opacity: 1;
}
.hero__content {
  position: relative;
  z-index: 1;
}

.hero__title {
  font-size: 2.5rem;
  margin-bottom: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  
}
.hero__title__btn {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  gap: 24px;
  flex-direction: row;
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
}
.catalog-card img {
  position: absolute;
  top: -40px;
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
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
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
}

.service-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 15px;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background: #0056b3;
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
</style>
