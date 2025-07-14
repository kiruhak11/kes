<template>
  <div class="vacancies-page" v-scroll-reveal="'fade-in'">
    <div class="container">
      <h1 class="section-title" v-scroll-reveal="'slide-in-left'">Вакансии</h1>
      <div class="vacancies-grid">
        <div
          class="card vacancy-card"
          v-for="vacancy in vacancies"
          :key="vacancy.title"
          v-scroll-reveal="'zoom-in'"
          @click="openVacancyModal(vacancy)"
          style="cursor: pointer"
        >
          <NuxtImg
            :placeholder="[67, 58, 45, 10]"
            sizes="400px xxs:900px md:1200px"
            format="webp"
            :src="vacancy.img"
            :alt="vacancy.title"
            class="vacancy-img"
          />
          <h2 class="vacancy-title">{{ vacancy.title }}</h2>
          <p class="vacancy-short">{{ vacancy.short }}</p>
          <div class="vacancy-card-spacer"></div>
          <div class="price">
            Зарплата от: <span>{{ vacancy.price.toLocaleString() }} ₽</span>
          </div>
        </div>
      </div>
      <div class="vacancy-motivation card" v-scroll-reveal="'fade-in-up'">
        <h2>Поможем освоиться новичкам!</h2>
        <p>
          Главное — ваше желание работать и развиваться. Мы поддержим и обучим
          на старте!
        </p>
        <div class="vacancy-motivation-phone">
          <button class="btn btn-primary" @click="callPhone(contacts.phone[0])">
            Телефон: {{ contacts.phone[0] }}
          </button>
          <NuxtLink class="btn btn-primary" to="/contact"
            >Заказать звонок</NuxtLink
          >
        </div>
      </div>
      <div
        v-if="showModal && selectedVacancy"
        class="vacancy-modal-overlay"
        @click.self="closeVacancyModal"
      >
        <div class="vacancy-modal">
          <button class="modal-close" @click="closeVacancyModal">×</button>
          <NuxtImg
            :placeholder="[67, 58, 45, 10]"
            sizes="400px xxs:900px md:1200px"
            format="webp"
            :src="selectedVacancy.img"
            :alt="selectedVacancy.title"
            class="vacancy-modal-img"
          />
          <h2 class="vacancy-modal-title">{{ selectedVacancy.title }}</h2>
          <div class="vacancy-info">
            <div v-if="selectedVacancy.duties" class="vacancy-block">
              <div class="vacancy-block-title">
                <span class="icon-svg" v-html="dutyIcon"></span> Обязанности
              </div>
              <ul>
                <li v-for="duty in selectedVacancy.duties" :key="duty">
                  {{ duty }}
                </li>
              </ul>
            </div>
            <div v-if="selectedVacancy.requirements" class="vacancy-block">
              <div class="vacancy-block-title">
                <span class="icon-svg" v-html="reqIcon"></span> Требования
              </div>
              <ul>
                <li v-for="req in selectedVacancy.requirements" :key="req">
                  {{ req }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { contacts } from "~/data/contacts";
import { ref } from "vue";
import { useHead } from "nuxt/app";

interface Vacancy {
  title: string;
  img: string;
  short: string;
  duties: string[];
  requirements: string[];
  price: number;
}

const callPhone = (phone: any) => {
  window.location.href = `tel:${phone}`;
};

const vacancies: Vacancy[] = [
  {
    title: "Сварщик",
    img: "/vac/svarshik.png",
    short: "Выполнение сварочных работ под давлением на производстве.",
    duties: ["Сварка под давлением"],
    requirements: ["Знание техники безопасности"],
    price: 50000,
  },
  {
    title: "Конструктор (создание чертежей)",
    img: "/vac/inj.jpg",
    short:
      "Разработка и создание чертежей в Компас 3D, проектирование новых изделий.",
    duties: [
      "Моделирование в КОМПАС-3D существующих проектов;",
      "Выполнение деталировок в соответствии с техническим заданием и исходными данными (чертежами, моделями, макетами и т.д.);",
      "Оформление чертежей по эскизам;",
      "Внесение изменений в существующие проекты в связи с корректировкой технологических процессов.",
    ],
    requirements: [
      "Базовое знание КОМПАС-3D;",
      "Знание основ машиностроения, технологии металлообработки.",
    ],
    price: 50000,
  },
  {
    title: "Слесарь",
    img: "/vac/slesar.png",
    short: "Сборка, резка, монтаж и работа с инструментом на производстве.",
    duties: [
      "Резка уголка болгаркой",
      "Укладка теплоизоляционных материалов",
      "Установка стальных листов обшивки",
      "Крепление обшивки заклепками и электродрелью",
      "Сборка элементов изоляции",
      "Сборка деталей под прихватку и сварку",
      "Работа с ручным электроинструментом",
    ],
    requirements: [
      "Умение читать чертежи",
      "Навык работы с электроинструментом",
      "Навык сварочных работ (прихватки)",
      "Опыт не обязателен. ОБУЧЕНИЕ НА МЕСТЕ.",
    ],
    price: 50000,
  },
];

const showModal = ref(false);
const selectedVacancy = ref<Vacancy | null>(null);
function openVacancyModal(vacancy: Vacancy) {
  selectedVacancy.value = vacancy;
  showModal.value = true;
}
function closeVacancyModal() {
  showModal.value = false;
  selectedVacancy.value = null;
}

const dutyIcon = `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='2' y='2' width='16' height='16' rx='4' fill='#007bff'/><path d='M7 10.5l2 2 4-4' stroke='#fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
const reqIcon = `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='2' y='2' width='16' height='16' rx='4' fill='#28a745'/><path d='M7 8h6M7 12h6' stroke='#fff' stroke-width='2' stroke-linecap='round'/></svg>`;

useHead({
  title: "Вакансии — КотлоЭнергоСнаб",
  meta: [
    {
      name: "description",
      content:
        "Актуальные вакансии КотлоЭнергоСнаб. Работа на котельном заводе в Барнауле.",
    },
    {
      name: "keywords",
      content: "КотлоЭнергоСнаб, вакансии, работа, Барнаул, котельный завод",
    },
    { name: "author", content: "КотлоЭнергоСнаб" },
    { property: "og:site_name", content: "КотлоЭнергоСнаб" },
    { property: "og:title", content: "Вакансии — КотлоЭнергоСнаб" },
    {
      property: "og:description",
      content:
        "Актуальные вакансии КотлоЭнергоСнаб. Работа на котельном заводе в Барнауле.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://kes-sib.ru/vacancies" },
    { property: "og:image", content: "/images/hero1.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Вакансии — КотлоЭнергоСнаб" },
    {
      name: "twitter:description",
      content:
        "Актуальные вакансии КотлоЭнергоСнаб. Работа на котельном заводе в Барнауле.",
    },
    { name: "robots", content: "index, follow" },
  ],
  link: [
    { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    { rel: "canonical", href: "https://kes-sib.ru/vacancies" },
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
</script>

<style scoped>
.vacancy-motivation-phone {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
}
.btn {
  width: 100%;
  max-width: 420px;
  color: white;
  margin: 0 auto;
  margin-bottom: 1rem;
  text-align: center;
  border-radius: 0.5rem;
}

.vacancies-page {
  padding: 2rem 0 4rem 0;
}
.section-title {
  text-align: center;
  margin-bottom: 2rem;
}
.vacancies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 2.5rem;
}
.vacancy-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 480px;
  max-width: 370px;
  margin: 0 auto;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem 1.2rem 2rem 1.2rem;
  justify-content: flex-start;
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
}
.vacancy-card-spacer {
  flex: 1 1 auto;
}
.price {
  background: #f6f6f6;
  color: #e31e24;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 0.5rem;
  box-shadow: none;
  padding: 0.45rem 0.7rem;
  margin-top: 1.2rem;
  margin-bottom: 0;
  align-self: stretch;
  text-align: center;
  letter-spacing: 0.01em;
  position: relative;
  z-index: 2;
  border: 1px solid #ececec;
  transition: color 0.2s, background 0.2s;
}
.price span {
  font-size: 1.12em;
  font-weight: 900;
  color: #e31e24;
  text-shadow: none;
}
.vacancy-card:hover .price {
  background: #f0f0f0;
  color: #c41820;
}
.vacancy-img {
  width: 100%;
  max-width: 320px;
  height: 180px;
  object-fit: cover;
  border-radius: 0.75rem;
  margin-bottom: 1.2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.vacancy-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.vacancy-details {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 1.1rem;
  color: var(--text, #222);
}
.vacancy-details li {
  margin-bottom: 0.5rem;
}
.vacancy-motivation {
  margin: 0 auto;
  max-width: 600px;
  text-align: center;
  padding: 2rem 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  font-size: 1.2rem;
}
.vacancy-motivation h2 {
  margin-bottom: 0.7rem;
  font-size: 1.4rem;
  font-weight: 700;
}
.vacancy-info {
  width: 100%;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  flex: 1 1 auto;
  justify-content: space-between;
}
.vacancy-block {
  background: #f7faff;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.06);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.vacancy-block-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.icon-svg {
  display: inline-flex;
  vertical-align: middle;
  margin-right: 0.3em;
}
.vacancy-block ul {
  margin: 0;
  padding-left: 1.2em;
  list-style: disc;
}
.vacancy-block li {
  margin-bottom: 0.3em;
  font-size: 1rem;
}
.vacancy-short {
  color: #555;
  font-size: 1.08rem;
  margin-bottom: 0.7rem;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (max-width: 600px) {
  .vacancy-card {
    min-height: 420px;
    padding: 1rem 0.5rem 1.5rem 0.5rem;
  }
}
.vacancy-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInModal 0.3s;
}
@keyframes fadeInModal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.vacancy-modal {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  padding: 2.2rem 2rem 2rem 2rem;
  max-width: 420px;
  width: 100%;
  position: relative;
  animation: modalPop 0.25s;
}
@keyframes modalPop {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.modal-close {
  position: absolute;
  top: 1.1rem;
  right: 1.1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}
.modal-close:hover {
  color: #e31e24;
}
.vacancy-modal-img {
  width: 100%;
  max-width: 320px;
  height: 160px;
  object-fit: cover;
  border-radius: 0.75rem;
  margin-bottom: 1.2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.vacancy-modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  text-align: center;
}
</style>
