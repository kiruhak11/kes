<template>
  <div
    class="product-info-block"
    :class="{ 'no-reveal': isMobile }"
    v-scroll-reveal="!isMobile && 'slide-in-right'"
  >
    <h1 class="product-title">
      {{ productName }}
    </h1>
    <div class="product-main-row">
      <div class="product-main-description">
        <div class="product-short-description extended-description-content">
          {{ description }}
          <a href="#" class="details-link" @click.prevent="scrollToDescription">
            Подробнее...
          </a>
        </div>
      </div>
      <div class="product-main-specs">
        <div
          v-for="spec in displaySpecs.slice(0, 4)"
          :key="spec.id"
          class="spec-item"
        >
          <span class="spec-label">{{
            capitalize(spec.key).slice(0, 48) +
            (spec.key.length > 48 ? "..." : "")
          }}</span>
          <span class="spec-dots"></span>
          <span class="spec-value">{{ spec.value }}</span>
        </div>

        <!-- Кнопка перехода к техническим характеристикам -->
        <button
          v-if="displaySpecs.length > 0"
          @click="switchToSpecs"
          class="specs-button"
        >
          Подробнее о характеристиках...
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Characteristic } from "~/types/product";

interface Props {
  productName: string;
  description: string;
  displaySpecs: Characteristic[];
  isMobile: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  "scroll-to-description": [];
  "switch-to-specs": [];
}>();

// Функция для скролла к описанию
const scrollToDescription = () => {
  emit("scroll-to-description");
};

// Функция для переключения на вкладку характеристик
const switchToSpecs = () => {
  emit("switch-to-specs");
};

// Обработчик кликов в описании (для обратной совместимости)
const handleDescriptionClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains("details-link")) {
    event.preventDefault();
    scrollToDescription();
  }
};

const capitalize = (s: string) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  const result = text.replace(/[&<>"']/g, (m) => map[m]);
  return result;
}

function parseInlineMarkdown(text: string): string {
  // Обработка жирного текста
  text = text.replace(/\*\*(.*?)\*\*/g, (match, content) => {
    return `<strong>${content}</strong>`;
  });
  // Обработка курсива
  text = text.replace(/\*(.*?)\*/g, (match, content) => {
    return `<em>${content}</em>`;
  });
  return text;
}

function parseExtendedDescription(description: string | null): string {
  if (!description) {
    return "";
  }

  const lines = description.split("\n");

  let html = "";
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Пропускаем пустые строки, но добавляем разрыв строки
    if (!line) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      if (i > 0 && i < lines.length - 1) {
        html += "<br>";
      }
      continue;
    }

    // Обработка заголовков и других элементов
    if (line.startsWith("### ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      const text = escapeHtml(line.substring(4));
      html += `<h3 class="description-h3">${parseInlineMarkdown(text)}</h3>`;
    } else if (line.startsWith("## ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      const text = escapeHtml(line.substring(3));
      html += `<h2 class="description-h2">${parseInlineMarkdown(text)}</h2>`;
    } else if (line.startsWith("# ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      const text = escapeHtml(line.substring(2));
      html += `<h1 class="description-h1">${parseInlineMarkdown(text)}</h1>`;
    } else if (line.startsWith("- ")) {
      if (!inList) {
        html += '<ul class="description-list">';
        inList = true;
      }
      const text = escapeHtml(line.substring(2));
      html += `<li class="description-list-item">${parseInlineMarkdown(
        text
      )}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      const text = escapeHtml(line);
      html += `<p class="description-paragraph">${parseInlineMarkdown(
        text
      )}</p>`;
    }
  }

  if (inList) {
    html += "</ul>";
  }

  return html;
}
</script>

<style scoped lang="scss">
.product-info-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  justify-content: flex-start;
}

.product-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0;
  color: #222;
  text-align: left;
}

.product-short-description {
  color: #555;
  margin-bottom: 0;
  line-height: 1.5;
  text-align: left;
}

.product-main-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  margin-top: 12px;
}

.product-main-description {
  flex: 2;
  font-size: 1.08rem;
  color: #444;
  line-height: 1.6;
  text-align: left;

  .details-link {
    color: var(--accent);
    text-decoration: none;
    font-weight: 300;
    font-size: 1.05rem;
    cursor: pointer;
    transition: color 0.3s ease, border-bottom-color 0.3s ease,
      transform 0.3s ease;
    border-bottom: 1px solid transparent;

    &:hover {
      color: var(--accent-dark);
      border-bottom-color: var(--accent);
      text-decoration: none;
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

.product-main-specs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.85rem;
  padding: 0.1rem 0;
  gap: 0.5rem;
  min-height: 1.8em;
}

.spec-label {
  color: var(--text-light);
  white-space: nowrap;
}

.spec-dots {
  flex-grow: 1;
  border-bottom: 2px dotted #e0e0e0;
  position: relative;
  top: 1rem;
}

.spec-value {
  font-weight: 500;
  text-align: right;
  white-space: normal;
  word-wrap: break-word;
  max-width: 60%;
  line-height: 1.4;
  padding-left: 10px;
  overflow-wrap: break-word;
  hyphens: auto;
}

// Добавляем стили для мобильной версии
.no-reveal {
  opacity: 1 !important;
  transform: none !important;
  visibility: visible !important;
}

// Кнопка технических характеристик
.specs-button {
  width: 100%;
  background: white;
  color: var(--text);
  border: 1px solid var(--accent);
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 300;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease,
    transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 4px rgba(227, 30, 36, 0.2);

  &:hover {
    background: var(--accent);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(227, 30, 36, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(227, 30, 36, 0.2);
  }
}

/* Стили для форматированного описания */
:deep(.extended-description-content) {
  line-height: 1.6;

  // Стили для кликабельной ссылки "Подробнее..."
  .details-link {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.3s ease, border-bottom-color 0.3s ease,
      transform 0.3s ease;
    border-bottom: 1px solid transparent;

    &:hover {
      color: var(--accent-dark);
      border-bottom-color: var(--accent);
      text-decoration: none;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  ul,
  ol {
    list-style-position: outside;
    padding-left: 1.5rem;
    margin: 1rem 0;
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
    color: var(--text);
    white-space: normal;
  }

  /* Вложенные списки */
  ul ul,
  ol ul {
    list-style-type: circle;
    margin: 0.5rem 0;
  }

  ul ol,
  ol ol {
    list-style-type: lower-alpha;
    margin: 0.5rem 0;
  }

  /* Параграфы */
  p {
    margin: 1rem 0;
    white-space: normal;
  }

  /* Заголовки */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 1.5rem 0 1rem;
    color: var(--text);
    font-weight: 600;
    line-height: 1.3;
  }

  h1 {
    font-size: 2rem;
  }
  h2 {
    font-size: 1.75rem;
  }
  h3 {
    font-size: 1.5rem;
  }
  h4 {
    font-size: 1.25rem;
  }
  h5 {
    font-size: 1.1rem;
  }
  h6 {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .product-title {
    font-size: 1.1rem;
  }

  .product-main-row {
    flex-direction: column;
    gap: 12px;
  }

  .product-main-specs {
    max-width: 100%;
    min-width: 0;
  }

  .product-main-description {
    .details-link {
      display: block;
      margin: 0.5rem 0 0 0;
      font-size: 0.9rem;
    }
  }

  .specs-button {
    font-size: 0.85rem;
    padding: 0.65rem 0.85rem;
  }
}
</style>
