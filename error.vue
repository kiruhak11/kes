<template>
  <div class="error-page">
    <div class="error-content">
      <NuxtImg
        :src="'/images/logo.png'"
        :placeholder="[67, 58, 45, 10]"
        sizes="400px xxs:900px md:1200px"
        format="webp"
        alt="Котельный завод КЭС"
        class="error-logo"
      />
      <h1 v-if="error.statusCode === 404">404</h1>
      <h1 v-else>Ошибка</h1>
      <h2 v-if="error.statusCode === 404">Страница не найдена</h2>
      <h2 v-else>Что-то пошло не так</h2>
      <p v-if="error.statusCode === 404">
        Похоже, вы попали не туда.<br />Но не переживайте — вы всегда можете
        вернуться на главную!
      </p>
      <p v-else>
        {{ error.message || "Произошла непредвиденная ошибка." }}
      </p>
      <NuxtLink to="/" class="btn-home">На главную</NuxtLink>
    </div>
    <div class="error-bg"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: {
    type: Object,
    required: true,
  },
});

// SEO Meta Tags
useHead({
  title: computed(() => {
    if (props.error.statusCode === 404) {
      return "404 - Страница не найдена — КотлоЭнергоСнаб";
    }
    return "Ошибка — КотлоЭнергоСнаб";
  }),
  meta: [
    {
      name: "description",
      content: computed(() => {
        if (props.error.statusCode === 404) {
          return "Страница не найдена. Вернитесь на главную страницу сайта КотлоЭнергоСнаб - производителя котельного оборудования в Барнауле.";
        }
        return "Произошла ошибка на сайте КотлоЭнергоСнаб. Вернитесь на главную страницу.";
      }),
    },
    {
      name: "keywords",
      content:
        "КотлоЭнергоСнаб, ошибка, страница не найдена, Барнаул, котельное оборудование",
    },
    { name: "author", content: "КотлоЭнергоСнаб" },
    { property: "og:site_name", content: "КотлоЭнергоСнаб" },
    {
      property: "og:title",
      content: computed(() => {
        if (props.error.statusCode === 404) {
          return "404 - Страница не найдена — КотлоЭнергоСнаб";
        }
        return "Ошибка — КотлоЭнергоСнаб";
      }),
    },
    {
      property: "og:description",
      content: computed(() => {
        if (props.error.statusCode === 404) {
          return "Страница не найдена. Вернитесь на главную страницу сайта КотлоЭнергоСнаб - производителя котельного оборудования в Барнауле.";
        }
        return "Произошла ошибка на сайте КотлоЭнергоСнаб. Вернитесь на главную страницу.";
      }),
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://kes-sib.ru/error" },
    { property: "og:image", content: "/images/hero1.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: computed(() => {
        if (props.error.statusCode === 404) {
          return "404 - Страница не найдена — КотлоЭнергоСнаб";
        }
        return "Ошибка — КотлоЭнергоСнаб";
      }),
    },
    {
      name: "twitter:description",
      content: computed(() => {
        if (props.error.statusCode === 404) {
          return "Страница не найдена. Вернитесь на главную страницу сайта КотлоЭнергоСнаб - производителя котельного оборудования в Барнауле.";
        }
        return "Произошла ошибка на сайте КотлоЭнергоСнаб. Вернитесь на главную страницу.";
      }),
    },
    { name: "robots", content: "noindex, nofollow" },
  ],
  link: [
    { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    { rel: "canonical", href: "https://kes-sib.ru/" },
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
.error-page {
  min-height: 100vh;
  background: linear-gradient(120deg, #fff 0%, #f5f5f5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.error-content {
  z-index: 2;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 2rem;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem 2.5rem 2.5rem 2.5rem;
  text-align: center;
  max-width: 420px;
  width: 100%;
  margin: 2rem;
  position: relative;
}
.error-logo {
  width: 320px;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 2px 8px rgba(227, 30, 36, 0.1));
}
h1 {
  font-size: 5rem;
  font-weight: 900;
  color: #e31e24;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.05em;
}
h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}
p {
  color: #666;
  font-size: 1.15rem;
  margin-bottom: 2rem;
}
.btn-home {
  display: inline-block;
  background: linear-gradient(90deg, #e31e24 0%, #ffb74d 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 0.9rem 2.2rem;
  border-radius: 2rem;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(227, 30, 36, 0.1);
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-home:hover {
  background: linear-gradient(90deg, #ffb74d 0%, #e31e24 100%);
  box-shadow: 0 8px 32px rgba(227, 30, 36, 0.18);
}
.error-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: url("/images/hero4.png") center/cover no-repeat;
  opacity: 0.08;
  filter: blur(2px);
}
@media (max-width: 600px) {
  .error-content {
    padding: 2rem 0.7rem 1.5rem 0.7rem;
    max-width: 98vw;
  }
  h1 {
    font-size: 3.2rem;
  }
  h2 {
    font-size: 1.2rem;
  }
}
</style>
