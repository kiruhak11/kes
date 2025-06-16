<script setup lang="ts">
import { ref } from 'vue';
import { useNuxtApp } from '#app';
const { $device } = useNuxtApp();
import { contacts } from "~/data/contacts";

const sections = [
  {
    title: 'О нас',
    type: 'text',
    content: 'Котлы и котельное оборудование Барнаул — надёжность с 1998 года'
  },
  {
    title: 'Разделы',
    type: 'links',
    content: [
      { text: 'Главная', to: '/' },
      { text: 'Каталог', to: '/catalog' },
      { text: 'О нас', to: '/about' },
      { text: 'Статьи', to: '/blog' },
      { text: 'Контакты', to: '/contact' }
    ]
  },
  {
    title: 'Контакты',
    type: 'contacts',
    content: null
  },
  {
    title: 'Мы в соцсетях',
    type: 'text',
    content: 'Следите за нашими новостями'
  }
];

const openSections = ref(sections.map((_, index) => index === 0)); // Открыт только первый раздел по умолчанию

const toggleSection = (index: number) => {
  openSections.value[index] = !openSections.value[index];
};
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div v-if="$device.isMobile" class="footer__mobile">
        <div class="footer__logo">
          <img src="/images/logo.png" alt="Котельный завод РЭП" />
          <p class="footer__slogan">Производим котлы для тех, кто выбирает качество</p>
        </div>
        <nav class="footer__mobile-nav">
          <NuxtLink to="/catalog">Каталог</NuxtLink>
          <NuxtLink to="/about">О нас</NuxtLink>
          <NuxtLink to="/services">Услуги</NuxtLink>
          <NuxtLink to="/contacts">Контакты</NuxtLink>
        </nav>
        <div class="footer__phones">
          <a href="tel:88007001743">+7 (800) 700-17-43</a>
        </div>
        <div class="footer__bottom">
          <p class="footer__copyright">
            © Котельный завод "РЭП" 2006—2025.
          </p>
        </div>
      </div>
      <div v-else>
        <div class="footer__content">
          <div class="footer__logo">
            <img src="/images/logo.png" alt="ООО «КотлоЭнергоСнаб»" />
            <p class="footer__slogan">Котлы и котельное оборудование Барнаул — надёжность с 1998 года</p>
          </div>
          
          <div class="footer__nav">
            <div class="footer__nav-column">
              <h3 class="footer__nav-title">О заводе</h3>
              <ul class="footer__nav-list">
                <li><NuxtLink to="/about/documents">Документы завода</NuxtLink></li>
                <li><NuxtLink to="/about/questionnaires">Опросные листы</NuxtLink></li>
                <li><NuxtLink to="/about/calculator">Подобрать мощность котла</NuxtLink></li>
                <li><NuxtLink to="/about/leasing">Купить котлы и котельные в лизинг</NuxtLink></li>
                <li><NuxtLink to="/about/delivery">Доставка продукции</NuxtLink></li>
                <li><NuxtLink to="/about/claims">Претензии и возврат</NuxtLink></li>
                <li><NuxtLink to="/about/payment">Условия оплаты</NuxtLink></li>
                <li><NuxtLink to="/about/vacancies">Вакансии</NuxtLink></li>
                <li><NuxtLink to="/about/news">Новости</NuxtLink></li>
              </ul>
            </div>

            <div class="footer__nav-column">
              <h3 class="footer__nav-title">Каталог продукции</h3>
              <ul class="footer__nav-list">
                <li><NuxtLink to="/catalog/water-heating">Водогрейные котлы</NuxtLink></li>
                <li><NuxtLink to="/catalog/steam">Паровые котлы</NuxtLink></li>
                <li><NuxtLink to="/catalog/furnaces">Топки</NuxtLink></li>
                <li><NuxtLink to="/catalog/cyclones">Циклоны</NuxtLink></li>
                <li><NuxtLink to="/catalog/fuel-supply">Топливоподача и шлакоудаление</NuxtLink></li>
                <li><NuxtLink to="/catalog/skip-hoists">Скиповые подъемники</NuxtLink></li>
                <li><NuxtLink to="/catalog/automation">Котловая автоматика</NuxtLink></li>
                <li><NuxtLink to="/catalog/fans">Дымососы и вентиляторы</NuxtLink></li>
                <li><NuxtLink to="/catalog/grids">Колосники чугунные</NuxtLink></li>
              </ul>
            </div>

            <div class="footer__nav-column">
              <h3 class="footer__nav-title">Услуги завода</h3>
              <ul class="footer__nav-list">
                <li><NuxtLink to="/services/installation">Монтаж котельной</NuxtLink></li>
                <li><NuxtLink to="/services/design">Проектирование котельной</NuxtLink></li>
                <li><NuxtLink to="/services/startup">Пуско-наладка котельной</NuxtLink></li>
                <li><NuxtLink to="/services/turnkey">Котельная под ключ</NuxtLink></li>
              </ul>
            </div>

            <div class="footer__contacts">
              <h3 class="footer__nav-title">Контакты</h3>
              <div class="footer__phones">
                <a href="tel:+73852226337">+7 (3852) 226-337</a>
                <a href="tel:+73852226338">+7 (3852) 226-338</a>
                <a href="tel:+73852226938">+7 (3852) 226-938</a>
                <a href="tel:+73852226939">+7 (3852) 226-939</a>
              </div>
              <a href="mailto:kes-altai@mail.ru" class="footer__email">kes-altai@mail.ru</a>
              <button class="footer__callback">Заказать звонок</button>
              <div class="footer__social">
                <span>Мы в соцсетях</span>
                <!-- Add social media icons here -->
              </div>
            </div>
          </div>
        </div>

        <div class="footer__bottom">
          <p class="footer__copyright">
            © 2010—2025 ООО «КотлоЭнергоСнаб»
          </p>
          <p class="footer__disclaimer">
            Обращаем ваше внимание на то, что данный интернет-сайт носит информационный характер и не является публичной офертой, определяемой положениями Статьи 437 (2) Гражданского кодекса Российской Федерации. Для получения подробной информации о наличии, стоимости, комплектации указанных товаров и (или) услуг, обращайтесь к менеджерам отдела сбыта с помощью специальной формы связи или по телефону: +7 (3852) 226-337.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  background: #1a1a1a;
  color: #fff;
  padding: 60px 0 30px;
}

.footer__content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.footer__logo img {
  height: 60px;
  margin-bottom: 20px;
}

.footer__slogan {
  font-size: 16px;
  line-height: 1.4;
  color: #999;
}

.footer__nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer__nav-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #fff;
}

.footer__nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer__nav-list li {
  margin-bottom: 10px;
}

.footer__nav-list a {
  color: #999;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer__nav-list a:hover {
  color: #fff;
}

.footer__contacts {
  grid-column: 1 / -1;
}

.footer__phones {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.footer__phones a {
  color: #fff;
  text-decoration: none;
  font-size: 18px;
  font-weight: 500;
}

.footer__email {
  display: block;
  color: #999;
  text-decoration: none;
  margin-bottom: 20px;
}

.footer__callback {
  background: #e31e24;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
}

.footer__social {
  color: #999;
}

.footer__bottom {
  border-top: 1px solid #333;
  padding-top: 30px;
}

.footer__copyright {
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
}

.footer__disclaimer {
  color: #666;
  font-size: 12px;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.footer__mobile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 16px;
  background: #1a1a1a;
  color: #fff;
  .footer__logo img {
    height: 48px;
    margin-bottom: 10px;
  }
  .footer__slogan {
    font-size: 13px;
    color: #aaa;
    margin-bottom: 18px;
    text-align: center;
  }
  .footer__mobile-nav {
    display: flex;
    gap: 18px;
    margin-bottom: 18px;
    a {
      color: #fff;
      font-size: 1rem;
      text-decoration: none;
      font-weight: 500;
    }
  }
  .footer__phones {
    margin-bottom: 12px;
    a {
      color: #fff;
      font-size: 1.1rem;
      text-decoration: none;
    }
  }
  .footer__bottom {
    font-size: 12px;
    color: #888;
    text-align: center;
  }
}
@media (max-width: 768px) {
  .footer__content, .footer__nav, .footer__nav-column, .footer__contacts {
    display: none !important;
  }
}
</style>
