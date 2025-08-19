<template>
  <!-- Компонент для добавления структурированных данных Schema.org -->
</template>

<script setup lang="ts">
// Компонент для добавления SEO схем на все страницы
// Этот компонент можно импортировать в layout для глобального использования

interface SEOSchemaProps {
  type?: "Organization" | "WebSite" | "Product" | "BreadcrumbList";
  data?: any;
}

const props = withDefaults(defineProps<SEOSchemaProps>(), {
  type: "Organization",
  data: () => ({}),
});

// Базовая схема организации
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "КотлоЭнергоСнаб",
  alternateName: ["Котельный завод КЭС", "КЭС", "КотлоЭнергоСнаб"],
  url: "https://kes-sib.ru/",
  logo: "https://kes-sib.ru/logo.png",
  description:
    "Котельный завод КотлоЭнергоСнаб - производство котельного оборудования в Барнауле",
  foundingDate: "2000",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Барнаул",
    addressCountry: "RU",
    addressRegion: "Алтайский край",
    postalCode: "656000",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+7-3852-555-555",
    contactType: "customer service",
    areaServed: "RU",
    availableLanguage: "Russian",
  },
  sameAs: ["https://kes-sib.ru/"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Каталог котельного оборудования",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Водогрейные котлы",
          description: "Водогрейные котлы КВр, КВа, КВз, КВБр, КВс, КВТС, КВГМ",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Паровые котлы",
          description: "Паровые котлы производительностью от 0,5 до 25 т/ч",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Модульные котельные",
          description: "Модульные котельные установки КМТ, МКУ, ТКУ",
        },
      },
    ],
  },
  areaServed: {
    "@type": "Country",
    name: "Россия",
  },
  serviceArea: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: 53.3548,
      longitude: 83.7698,
    },
    geoRadius: "10000",
  },
};

// Схема веб-сайта
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "КотлоЭнергоСнаб",
  url: "https://kes-sib.ru/",
  description: "Официальный сайт котельного завода КотлоЭнергоСнаб",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://kes-sib.ru/catalog?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

// Функция для получения схемы в зависимости от типа
const getSchema = () => {
  switch (props.type) {
    case "WebSite":
      return websiteSchema;
    case "Organization":
    default:
      return organizationSchema;
  }
};

// Добавляем структурированные данные в head
useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify(getSchema()),
    },
  ],
});
</script>
