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
          <div class="catalog-card" v-for="(card, idx) in catalogCards" :key="idx">
            <img :src="card.img" :alt="card.alt" />
            <h3>{{ card.title }}</h3>
            <p v-if="!$device.isMobile">{{ card.desc }}</p>
            <NuxtLink :to="card.link" class="btn btn-primary">Подробнее</NuxtLink>
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
            <select>
              <option>Административные здания</option>
              <option>Бани</option>
              <option>Больницы</option>
              <option>Гаражи</option>
              <option>Гостиницы</option>
              <option>Детские сады</option>
              <option>Жилые постройки 1930-1958 г.г</option>
              <option>Жилые постройки после 1958 г.</option>
              <option>Кафе рестораны</option>
              <option>Кинотеатр</option>
              <option>Клубы</option>
              <option>Магазины</option>
              <option>Пожарные Депо</option>
              <option>Поликлиники</option>
              <option>Школы</option>
            </select>
          </div>
          <div class="form-group">
            <label>Вид топлива</label>
            <select>
              <option>Газ</option>
              <option>Твердое топливо</option>
              <option>Жидкое топливо</option>
              <option>Электричество</option>
            </select>
          </div>
          <div class="form-group">
            <label>Тип мощности</label>
            <select>
              <option>Паровая</option>
              <option>Водогрейная</option>
            </select>
          </div>
          <div class="form-group">
            <label>Регион</label>
            <select>
              <option>Выберите регион</option>
              <!-- Add regions -->
            </select>
          </div>
          <button class="btn btn-primary">Рассчитать</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useNuxtApp } from '#app'
const { $device } = useNuxtApp()

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

const catalogCards = [
  {
    img: '/images/catalog/water-heating.jpg',
    alt: 'Водогрейные котлы',
    title: 'Водогрейные котлы',
    desc: 'Водогрейные котлы КВр, КВм, КВа, КВ мощностью до 4 МВт для отопления и горячего водоснабжения зданий и промышленных предприятий. Широкий модельный ряд позволяет подобрать котел для существующей или строящейся котельной.',
    link: '/catalog/water-heating',
  },
  {
    img: '/images/catalog/steam.jpg',
    alt: 'Паровые котлы',
    title: 'Паровые котлы',
    desc: 'Промышленные паровые котлы на всех видах топлива. Мощность 300, 500, 700, 1000 кг пара в час, температура пара 115 - 170 °С, давление 0,07-0,8 МПа.',
    link: '/catalog/steam',
  },
  {
    img: '/images/catalog/furnaces.jpg',
    alt: 'Топки',
    title: 'Топки',
    desc: 'Топки ТШПМ, ТЛЗМ, ТЧЗМ, ТЛПХ',
    link: '/catalog/furnaces',
  },
]
</script>

<style scoped>
@use "@/assets/styles/collection/functions" as *;

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
  padding: 80px 0;
}

.catalog-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
}

.catalog-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 20px;
}

.catalog-card h3 {
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-group select,
.form-group input[type="text"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.calculator .btn {
  width: 100%;
  padding: 10px;
  margin-top: 20px;
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
    padding: 16px;
    gap: 10px;
  }
  .form-group label {
    font-size: 14px;
    margin-bottom: 4px;
  }
  .calculator .btn {
    padding: 8px;
    font-size: 1rem;
  }
}
</style>
