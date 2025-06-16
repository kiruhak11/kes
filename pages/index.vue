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
            <span v-if="!$device.isMobile">Котельный завод «РЭП» — Проектирование, производство, монтаж, пуско-наладка котлов и котельного оборудования</span>
            <span v-else>Котельный завод «РЭП»<br>Производство и монтаж котлов</span>
          </h1>
          <NuxtLink to="/about" class="btn btn-primary">Подробнее о заводе</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Catalog Section -->
    <section class="catalog">
      <div class="container">
        <h2 class="section-title">Каталог продукции</h2>
        <div :class="['grid', $device.isMobile ? 'grid-1' : 'grid-3']">
          <div class="catalog-card" v-for="category in mainCategories" :key="category.slug">
            <img :src="category.image" :alt="category.title" />
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
            <div class="about__tour">
              <img src="/images/about/tour.jpg" alt="3D-тур по заводу" />
              <h3>3D-тур по заводу</h3>
              <p>Виртуальный тур нашего завода</p>
            </div>
            <div class="about__tour">
              <img src="/images/about/boiler-room.jpg" alt="3D-тур по котельной" />
              <h3>3D-тур по котельной</h3>
              <p>Виртуальный тур нашего завода</p>
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
            <h3>Монтаж котельной</h3>
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
        <h2 class="section-title">Подберите необходимую мощность котельной для вашего объекта</h2>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useNuxtApp } from '#app'
const { $device } = useNuxtApp()

// Получаем реальные категории для каталога на главной
interface Category {
  title: string;
  slug: string;
  image: string;
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
    console.log("Telegram response:", res);
    // тут можно очистить поля и показать уведомление пользователю
  } catch (err) {
    console.error("Ошибка отправки:", err);
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

onMounted(() => {
  intervalId = window.setInterval(() => {
    currentHero.value = (currentHero.value + 1) % heroImages.length
  }, 5000) // 5 секунд на каждый фон
})
onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
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

.section-title {
  text-align: center;
  margin-bottom: 40px;
  font-size: 2rem;
}

.catalog {
  padding: 60px 0 80px 0;
}

.catalog-card {
  background: #fff;
  border-radius: 8px;
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
  background: #f7f7fa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
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
}

.about__list {
  list-style: disc;
  padding-left: 20px;
}

.about__list li {
  margin-bottom: 15px;
}

.about__media {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.about__tour img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 15px;
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
  }
  
  .about__media {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero,
  .hero--mobile {
    padding: 40px 0;
  }
  .hero__title,
  .hero--mobile .hero__title {
    font-size: 1.3rem;
    max-width: 95vw;
  }
  .catalog .grid-3,
  .catalog .grid-1 {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .catalog-card {
    padding: 16px;
  }
  .catalog-card img {
    height: 120px;
  }
  .about {
    padding: 40px 0;
  }
  .about__content {
    gap: 20px;
  }
  .about__list li {
    font-size: 14px;
    margin-bottom: 10px;
  }
  .about__media {
    gap: 10px;
  }
  .about__tour img {
    height: 120px;
    margin-bottom: 8px;
  }
  .about__tour h3 {
    font-size: 1rem;
    margin-bottom: 4px;
  }
  .services {
    padding: 40px 0;
  }
  .grid.grid-4 {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .service-card img {
    height: 100px;
    margin-bottom: 8px;
  }
  .service-card h3 {
    font-size: 1rem;
  }
  .calculator {
    padding: 40px 0;
  }
  .calculator__form {
    padding: 20px;
    gap: 16px;
  }
  .input-with-select select,
  .input-with-select input,
  .region-search,
  .phone-field {
    font-size: 14px;
    padding: 10px;
  }
  .phone-prefix {
    font-size: 14px;
  }
}
</style>
