<script setup lang="ts">
import { ref, computed } from "vue";
const { $device } = useNuxtApp();
import { contacts } from "~/data/contacts";

const sections = [
  {
    title: "О нас",
    type: "text",
    content: "Котлы и котельное оборудование Барнаул — надёжность с 1998 года",
  },
  {
    title: "Разделы",
    type: "links",
    content: [
      { text: "Главная", to: "/" },
      { text: "Каталог", to: "/catalog" },
      { text: "О компании", to: "/about" },
      { text: "Контакты", to: "/about/contacts" },
    ],
  },
  {
    title: "Контакты",
    type: "contacts",
    content: null,
  },
  {
    title: "Мы в соцсетях",
    type: "text",
    content: "Следите за нашими новостями",
  },
];

const openSections = ref(sections.map((_, index) => index === 0)); // Открыт только первый раздел по умолчанию

const toggleSection = (index: number) => {
  openSections.value[index] = !openSections.value[index];
};

// Получаем категории для футера
interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

const { data: fetchedCategories, error: fetchError } = await useFetch<{
  categories: Category[];
}>("/api/categories", {
  key: "footer-categories",
});

const footerCategories = computed(() => {
  if (!fetchedCategories.value?.categories) return [];
  return fetchedCategories.value.categories.slice(0, 5).map((cat) => ({
    title: cat.name,
    slug: cat.slug,
    image: cat.image,
    description: cat.description,
  }));
});

if (fetchError.value) {
  console.error("Error loading categories:", fetchError.value);
}
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div v-if="$device.isMobile" class="footer__mobile">
        <div class="footer__logo">
          <NuxtImg
            :src="'/images/logo-white.png'"
            :placeholder="true"
            sizes="400px xxs:900px md:1200px"
            format="webp"
            alt="ООО «КотлоЭнергоСнаб»"
          />
          <p class="footer__slogan">
            Производим котлы для тех, кто выбирает качество
          </p>
        </div>
        <nav class="footer__mobile-nav">
          <NuxtLink to="/catalog">Каталог</NuxtLink>
          <NuxtLink to="/about">О нас</NuxtLink>
          <NuxtLink to="/contact">Услуги</NuxtLink>
          <NuxtLink to="/contacts">Контакты</NuxtLink>
        </nav>
        <div class="footer__phones">
          <a href="tel:{{ contacts.phone[0] }}">{{ contacts.phone[0] }}</a>
        </div>
        <div class="footer__bottom">
          <p class="footer__copyright">© Котельный завод "КЭС" 2009—2025.</p>
        </div>
      </div>
      <div v-else>
        <div class="footer__content">
          <div class="footer__logo">
            <NuxtImg
              :src="'/images/logo-white.png'"
              :placeholder="true"
              sizes="400px xxs:900px md:1200px"
              format="webp"
              alt="ООО «КотлоЭнергоСнаб»"
            />
            <p class="footer__slogan">
              Котлы и котельное оборудование Барнаул — надёжность с 2009 года
            </p>
          </div>

          <div class="footer__nav">
            <div class="footer__nav-column">
              <h3 class="footer__nav-title">О заводе</h3>
              <ul class="footer__nav-list">
                <li><NuxtLink to="/certificates">Сертификаты</NuxtLink></li>
                <li><NuxtLink to="/about/contacts">Контакты</NuxtLink></li>
                <li><NuxtLink to="/contact">Оставить заявку</NuxtLink></li>
                <li><NuxtLink to="/cart">Корзина</NuxtLink></li>
                <li><NuxtLink to="/about">О компании</NuxtLink></li>
              </ul>
            </div>

            <div class="footer__nav-column">
              <h3 class="footer__nav-title">Каталог продукции</h3>
              <ul class="footer__nav-list">
                <li><NuxtLink to="/catalog">Все категории</NuxtLink></li>
                <li v-for="category in footerCategories" :key="category.slug">
                  <NuxtLink :to="`/catalog/${category.slug}`">{{
                    category.title
                  }}</NuxtLink>
                </li>
              </ul>
            </div>

            <div class="footer__nav-column">
              <h3 class="footer__nav-title">Контакты</h3>
              <div class="footer__phones" v-if="contacts.phone.length > 0">
                <a
                  v-for="phone in contacts.phone"
                  :key="phone"
                  href="tel:{{ phone }}"
                  >{{ phone }}</a
                >
              </div>
              <a href="mailto:{{ contacts.email }}" class="footer__email">{{
                contacts.email
              }}</a>
              <NuxtLink to="/contact" class="btn footer__callback"
                >Заказать звонок</NuxtLink
              >
            </div>
          </div>
        </div>

        <div class="footer__bottom">
          <p class="footer__copyright">
            © 2009—2025 ООО «КотлоЭнергоСнаб» {{ contacts.workingHours }}
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
  position: relative;
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
  .footer {
    padding: 10px 0 20px;
  }
  .footer__content,
  .footer__nav,
  .footer__nav-column,
  .footer__contacts {
    display: none !important;
  }
}
</style>
