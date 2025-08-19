<template>
  <!-- Компонент для дополнительных SEO тегов -->
</template>

<script setup lang="ts">
// Компонент для добавления дополнительных SEO тегов
// Улучшает индексацию в поисковых системах

interface AdditionalSEOTagsProps {
  pageType?: "home" | "catalog" | "category" | "product" | "about" | "contacts";
  customData?: any;
}

const props = withDefaults(defineProps<AdditionalSEOTagsProps>(), {
  pageType: "home",
  customData: () => ({}),
});

// Дополнительные мета-теги для разных типов страниц
const getAdditionalMetaTags = () => {
  const baseTags = [
    // Теги для лучшей индексации в Яндексе
    {
      name: "yandex-verification",
      content: "verification_token_here", // Замените на ваш токен
    },
    {
      name: "yandex",
      content: "index, follow",
    },
    // Теги для Google
    {
      name: "google-site-verification",
      content: "verification_token_here", // Замените на ваш токен
    },
    {
      name: "googlebot",
      content:
        "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    },
    // Дополнительные теги для поисковых систем
    {
      name: "msvalidate.01",
      content: "verification_token_here", // Замените на ваш токен Bing
    },
    // Теги для социальных сетей
    {
      property: "og:site_name",
      content: "КотлоЭнергоСнаб",
    },
    {
      property: "og:locale",
      content: "ru_RU",
    },
    {
      property: "og:type",
      content: props.pageType === "product" ? "product" : "website",
    },
    // Теги для мобильных устройств
    {
      name: "mobile-web-app-capable",
      content: "yes",
    },
    {
      name: "apple-mobile-web-app-capable",
      content: "yes",
    },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "default",
    },
    {
      name: "apple-mobile-web-app-title",
      content: "КотлоЭнергоСнаб",
    },
    // Теги для безопасности
    {
      "http-equiv": "X-UA-Compatible",
      content: "IE=edge",
    },
    {
      "http-equiv": "Content-Security-Policy",
      content: "default-src 'self'",
    },
  ];

  // Специфичные теги для разных типов страниц
  const pageSpecificTags = {
    home: [
      {
        name: "keywords",
        content:
          "котлы, котельное оборудование, водогрейные котлы, паровые котлы, модульные котельные, теплообменники, дымососы, вентиляторы, котельный завод, Барнаул, Алтайский край, производство котлов, монтаж котельного оборудования, пуско-наладка, КВр, КВа, КВз, КВБр, КВс, КВТС, КВГМ, МКУ, ТКУ, КМТ, котлы Братск, котлы Универсал, котлы Энергия",
      },
    ],
    catalog: [
      {
        name: "keywords",
        content:
          "каталог котельного оборудования, котлы, котельные, теплообменники, водоподготовка, водогрейные котлы, паровые котлы, модульные котельные, дымососы, вентиляторы, КВр, КВа, КВз, МКУ, Барнаул, КотлоЭнергоСнаб",
      },
    ],
    product: [
      {
        name: "keywords",
        content:
          "котельное оборудование, котлы, котельные, теплообменники, дымососы, вентиляторы, водогрейные котлы, паровые котлы, модульные котельные, КВр, КВа, КВз, МКУ, ТКУ, КМТ, производство, монтаж, Барнаул, Алтайский край, КотлоЭнергоСнаб",
      },
    ],
    about: [
      {
        name: "keywords",
        content:
          "о заводе КотлоЭнергоСнаб, котельный завод, Барнаул, Алтайский край, производство котлов, водогрейные котлы, паровые котлы, модульные котельные, теплообменники, дымососы, вентиляторы, КВр, КВа, КВз, КВБр, КВс, КВТС, КВГМ, МКУ, ТКУ, КМТ, монтаж, сервис, проектирование, котельное оборудование",
      },
    ],
    contacts: [
      {
        name: "keywords",
        content:
          "контакты КотлоЭнергоСнаб, адрес котельного завода, телефон КЭС, реквизиты, Барнаул, Алтайский край, котельный завод, производство котлов, котельное оборудование, теплообменники, дымососы, вентиляторы",
      },
    ],
  };

  return [...baseTags, ...(pageSpecificTags[props.pageType] || [])];
};

// Добавляем дополнительные SEO теги в head
useHead({
  meta: getAdditionalMetaTags(),
  link: [
    // Предзагрузка важных ресурсов
    {
      rel: "preload",
      href: "/images/hero1.jpg",
      as: "image",
    },
    {
      rel: "preload",
      href: "/logo.png",
      as: "image",
    },
    // DNS prefetch для внешних ресурсов
    {
      rel: "dns-prefetch",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "dns-prefetch",
      href: "https://fonts.gstatic.com",
    },
    // Альтернативные языки (если планируется многоязычность)
    {
      rel: "alternate",
      hreflang: "ru",
      href: "https://kes-sib.ru/",
    },
    {
      rel: "alternate",
      hreflang: "x-default",
      href: "https://kes-sib.ru/",
    },
  ],
  htmlAttrs: {
    // Дополнительные атрибуты для HTML
    "data-site": "kes-sib",
    "data-company": "КотлоЭнергоСнаб",
  },
});
</script>
