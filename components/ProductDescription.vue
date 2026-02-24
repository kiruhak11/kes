<template>
  <div
    v-if="activeTab === 'description'"
    class="section-block"
    v-scroll-reveal="'slide-in-left'"
  >
    <h2 class="section-title">Описание товара</h2>
    <div
      class="extended-description-content"
      v-html="parseExtendedDescription(extendedDescription ?? null)"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  activeTab: string;
  extendedDescription?: string;
}

defineProps<Props>();

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
.section-block {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  padding: 32px 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.4rem;
  margin-bottom: 18px;
  color: #ff6b6b;
  font-weight: 700;
  text-align: left;
}

/* Стили для форматированного описания */
:deep(.extended-description-content) {
  line-height: 1.6;

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
  .section-block {
    padding: 16px 12px;
  }

  .section-title {
    font-size: 1.2rem;
  }
}
</style>
