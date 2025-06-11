<script setup lang="ts">
import { ref } from 'vue';
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
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-section" v-for="(section, index) in sections" :key="index">
        <div class="footer-header" @click="toggleSection(index)">
          <h5 class="footer-title">{{ section.title }}</h5>
          <span class="toggle-icon" :class="{ 'is-open': openSections[index] }">▼</span>
        </div>
        <div class="footer-content" :class="{ 'is-open': openSections[index] }">
          <template v-if="section.type === 'text'">
            <p>{{ section.content }}</p>
          </template>
          <template v-else-if="section.type === 'links'">
            <ul>
              <li v-for="(link, linkIndex) in section.content" :key="linkIndex">
                <NuxtLink :to="link.to">{{ link.text }}</NuxtLink>
              </li>
            </ul>
          </template>
          <template v-else-if="section.type === 'contacts'">
            <p>{{ contacts.phone[0] }}</p>
            <p>{{ contacts.email }}</p>
            <p>{{ contacts.address }}</p>
          </template>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 1998–2025 Котлы Барнаул. Все права защищены.</p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.site-footer {
  background: var(--primary);
  color: #fff;
  position: sticky;
  bottom: 0;
  width: 100%;
  margin-top: auto;

  .footer-inner {
    @include container();
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  .footer-section {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    &:last-child {
      border-bottom: none;
    }
  }

  .footer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    cursor: pointer;
    user-select: none;

    .footer-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
    }

    .toggle-icon {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
      transition: transform 0.3s ease;

      &.is-open {
        transform: rotate(180deg);
      }
    }
  }

  .footer-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out, padding 0.3s ease;
    padding: 0 1rem;

    &.is-open {
      max-height: 500px;
      padding: 0 1rem 1rem;
    }

    p,
    ul,
    li a {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin: 0;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 0.75rem;

        &:last-child {
          margin-bottom: 0;
        }

        a {
          display: inline-block;
          transition: all 0.3s ease;
          padding: 0.25rem 0;

          &:hover {
            color: var(--accent);
          }
        }
      }
    }
  }

  .footer-bottom {
    background: rgba(0, 0, 0, 0.1);
    text-align: center;
    padding: 0.75rem;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
  }
}

// Стили для планшетов
@media (max-width: 768px) {
  .site-footer {
    .footer-inner {
      padding: 0.75rem;
    }

    .footer-header {
      padding: 0.75rem 0;

      .footer-title {
        font-size: 1rem;
      }
    }

    .footer-content {
      p,
      ul,
      li a {
        font-size: 0.9rem;
      }
    }
  }
}

// Стили для мобильных
@media (max-width: 576px) {
  .site-footer {
    .footer-inner {
      padding: 0.5rem;
    }

    .footer-header {
      padding: 0.75rem 0;

      .footer-title {
        font-size: 0.95rem;
      }
    }

    .footer-content {
      padding: 0 0.5rem;

      &.is-open {
        padding: 0 0.5rem 0.75rem;
      }

      p,
      ul,
      li a {
        font-size: 0.9rem;
      }
    }

    .footer-bottom {
      padding: 0.5rem;
      font-size: 0.8rem;
    }
  }
}
</style>
