<template>
    <section class="about-page container">
      <nav class="breadcrumbs" v-scroll-reveal="'fade-in'">
        <NuxtLink to="/">Главная</NuxtLink> → О компании
      </nav>
  
      <h1 class="about-page__main-title" v-scroll-reveal="'fade-in-up'">О компании</h1>
  
      <h2 class="about-page__section-title" v-scroll-reveal="'fade-in-up'">Каталог продукции</h2>
      <ul class="about-page__list" v-scroll-reveal="'slide-in-left'">
        <li>Модульные котельные МКУ</li>
        <li>Паровые двухбарабанные котлы</li>
        <li>Дымососы</li>
        <li>Вентиляторы</li>
        <li>Золоуловители типа ЗУ</li>
        <li>Батарейные циклоны</li>
        <li>Циклоны типа ЦН-15</li>
        <li>Чугунное литье, колосники</li>
        <li>Экономайзеры</li>
        <li>Трубные пучки и барабаны котлов</li>
        <li>Котлы Братск</li>
      </ul>
  
      <h2 class="about-page__section-title" v-scroll-reveal="'fade-in-up'">О компании «КотлоЭнергоСнаб» (г. Барнаул)</h2>
      <p class="about-page__text" v-scroll-reveal="'slide-in-right'">
        Многолетний опыт наших сотрудников в сфере поставок промышленного и
        котельного оборудования позволит в кратчайшие сроки подобрать необходимые
        комплектующие для Вашего предприятия. Мы успешно сотрудничаем с
        предприятиями от Калининграда до Камчатки.
      </p>
  
      <h2 class="about-page__section-title" v-scroll-reveal="'fade-in-up'">Наши решения и услуги</h2>
  
      <h3 v-scroll-reveal="'fade-in-up'">Котлы</h3>
      <ul class="about-page__list" v-scroll-reveal="'slide-in-left'">
        <li>Водогрейные котлы <strong>КВр, КВа, КВз, КВБр, КВс, КВТС, КВГМ</strong> от 0,1 до 100 МВт (уголь, газ, мазут)</li>
        <li>Паровые котлы производительностью от 0,5 до 25 т/ч</li>
        <li>Котлы малой мощности <strong>КВ-300, КГТ-500, Е-1/9</strong> и др.</li>
        <li>Котлы и комплектующие Братск, Универсал, Энергия</li>
        <li>Котлы на нетрадиционных видах топлива (опилки, лузга, торф)</li>
        <li>Модульные котельные установки <strong>КМТ, МКУ, ТКУ</strong> от 0,5 до 6 МВт</li>
      </ul>
  
      <h3 v-scroll-reveal="'fade-in-up'">Трубопроводная арматура</h3>
      <p class="about-page__text" v-scroll-reveal="'slide-in-right'">
        Энергетическая арматура: вентили, задвижки, клапана, затворы, шаровые краны.
      </p>
  
      <h3 v-scroll-reveal="'fade-in-up'">Топки и запчасти</h3>
      <p class="about-page__text" v-scroll-reveal="'slide-in-left'">
        Топки и запчасти <strong>ТФГ, ТШПМ-1,45, ЗП-РПК, ТЛЗМ, ТЧЗМ, ТЛО, НТКС, ВЦКС</strong>.
      </p>
  
      <h3 v-scroll-reveal="'fade-in-up'">Вентиляторы</h3>
      <p class="about-page__text" v-scroll-reveal="'slide-in-right'">
        ВДН 6,3…13; ВД, ВЦ; осевые <strong>ВДОД-31,5, ВДОД-41</strong>; мельничные <strong>ВВСМ</strong>; горячего дутья <strong>ВГДН, ВГД</strong>; специальные <strong>ВВН, ВВР, ВСК, ВО, ВС, ВА, ВДП</strong>.
      </p>
  
      <h3 v-scroll-reveal="'fade-in-up'">Дымососы и насосы</h3>
      <ul class="about-page__list" v-scroll-reveal="'slide-in-left'">
        <li>Дымососы <strong>ДН 3,5…38, ДОД 28,5-ДОД</strong></li>
        <li>Насосы: консольные К, горизонтальные сетевые, центробежные (Wilo, Grundfos)</li>
      </ul>
  
      <h3 v-scroll-reveal="'fade-in-up'">Водоподготовительное и теплообменное оборудование</h3>
      <ul class="about-page__list" v-scroll-reveal="'slide-in-right'">
        <li>ВПУ 1,0…6,0; ДА; КДА; ФИПР, ФПО</li>
        <li>Экономайзеры (чугунные ЭБ, стальные БВЭС) и комплектующие</li>
        <li>Подогреватели: паровые ПП, водоводяные ВВП, пластинчатые</li>
        <li>Мазутаподготовка: ФилрФМ, БМП, подогреватели паровые/электрические</li>
      </ul>
  
      <h3 v-scroll-reveal="'fade-in-up'">Шлакоудаление и транспортёры</h3>
      <ul class="about-page__list" v-scroll-reveal="'slide-in-left'">
        <li>Линии шлакозолоудаления ШЗУ; питатели топлива ЗП-400 (600), ПТЛ-400 (600)</li>
        <li>Транспортеры: ленточные, скребковые, винтовые (подача угля)</li>
        <li>Золоуловители, циклоны <strong>ЗУ-1, ЦН-15, БЦ, ЦБ</strong></li>
      </ul>
  
      <h3 v-scroll-reveal="'fade-in-up'">Специальные изделия</h3>
      <ul class="about-page__list" v-scroll-reveal="'slide-in-right'">
        <li>Трубы кипятильные, экранные, перепускные</li>
        <li>Горелки <strong>ГМ, ГГ, ГБЛ, РМГ, БИГ, АПНД, Weishaupt, Unigas</strong></li>
        <li>Огнеупорная продукция: кирпич, асбокартон, мертель МШ-2,8, жидкое стекло</li>
        <li>Теплоизоляционные материалы: МКРВ, плиты базальтового волокна, ИЗОСПАН</li>
        <li>Химводоочистка: катионит, сульфоуголь</li>
        <li>Трубная продукция: полиэтиленовая, полипропиленовая, стальная</li>
        <li>Фитинги: отводы, переходы, тройники, уголки, муфты, фланцы</li>
        <li>Приборы КИП: манометры, термометры, теплосчетчики, водосчетчики</li>
        <li>Сварочное оборудование: электроды, проволока, электросварочное оборудование</li>
        <li>Электротехническая продукция: электродвигатели, кабельная продукция</li>
        <li>Проектирование, монтаж, пусконаладочные работы</li>
      </ul>
  
      <div class="about-page__contacts" v-scroll-reveal="'fade-in-up'">
        <p>
          Всю дополнительную информацию Вы можете получить, позвонив по телефону:
        </p>
        <a :href="`tel:${contacts.phone[0]}`">{{ contacts.phone[0] }}</a>
        <p>
          E-mail: <a :href="`mailto:${contacts.email}`">{{ contacts.email }}</a>
        </p>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
import { contacts } from '~/data/contacts';
import { useHead } from 'nuxt/app';

useHead({
  title: 'О компании КотлоЭнергоСнаб — Котельный завод КЭС Барнаул',
  meta: [
    {
      name: 'description',
      content: 'О компании КотлоЭнергоСнаб: производство котлов, котельного оборудования, монтаж, сервис, Барнаул.'
    },
    {
      name: 'keywords',
      content: 'КотлоЭнергоСнаб, о компании, котельный завод, Барнаул, котлы, производство, монтаж, сервис'
    },
    {
      name: 'author',
      content: 'КотлоЭнергоСнаб'
    },
    {
      property: 'og:site_name',
      content: 'КотлоЭнергоСнаб'
    },
    {
      property: 'og:title',
      content: 'О компании КотлоЭнергоСнаб — Котельный завод КЭС Барнаул'
    },
    {
      property: 'og:description',
      content: 'О компании КотлоЭнергоСнаб: производство котлов, котельного оборудования, монтаж, сервис, Барнаул.'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:url',
      content: 'https://kes-sib.ru/about/'
    },
    {
      property: 'og:image',
      content: '/images/hero1.jpg'
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      name: 'twitter:title',
      content: 'О компании КотлоЭнергоСнаб — Котельный завод КЭС Барнаул'
    },
    {
      name: 'twitter:description',
      content: 'О компании КотлоЭнергоСнаб: производство котлов, котельного оборудования, монтаж, сервис, Барнаул.'
    },
    {
      name: 'robots',
      content: 'index, follow'
    }
  ],
  link: [
    {
      rel: 'icon',
      href: '/favicon.ico',
      type: 'image/x-icon'
    },
    {
      rel: 'canonical',
      href: 'https://kes-sib.ru/about/'
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "http://schema.org",
        "@type": "Organization",
        "name": "КотлоЭнергоСнаб",
        "url": "https://kes-sib.ru/",
        "logo": "https://kes-sib.ru/favicon.ico"
      })
    }
  ]
});
  </script>
  
  <style lang="scss" scoped>
  .about-page {
    padding: 2rem 1rem;
  
    @media (min-width: 768px) {
      padding: 4rem 0;
    }
  
    .breadcrumbs {
      margin-bottom: 1rem;
      font-size: 0.9rem;
      a {
        color: var(--primary);
        &:hover {
          text-decoration: underline;
        }
      }
    }
  
    &__main-title {
      font-size: 1.75rem;
      text-align: center;
      margin-bottom: 1.5rem;
      color: var(--text);
  
      @media (min-width: 768px) {
        font-size: 2.5rem;
        margin-bottom: 2rem;
      }
    }
  
    &__section-title {
      font-size: 1.4rem;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      color: var(--accent);
  
      @media (min-width: 768px) {
        font-size: 1.75rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
      }
    }
  
    &__list {
      list-style: disc inside;
      margin: 0 0 1.5rem;
      padding: 0;
      li {
        margin-bottom: 0.5rem;
        color: var(--secondary);
        line-height: 1.5;
        font-size: 0.95rem;
  
        @media (min-width: 768px) {
          font-size: 1rem;
        }
      }
    }
  
    &__text {
      margin-bottom: 1.5rem;
      line-height: 1.6;
      color: var(--secondary);
      font-size: 0.95rem;
  
      @media (min-width: 768px) {
        font-size: 1rem;
      }
    }
  
    &__contacts {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--secondary);
      p {
        margin: 0.5rem 0;
        color: var(--text);
        font-size: 0.95rem;
  
        @media (min-width: 768px) {
          font-size: 1rem;
        }
      }
      a {
        color: var(--primary);
      }
    }
  }
  </style>
  