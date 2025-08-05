<template>
  <div class="related-products-section">
    <h2 class="section-title">Вам также может понравиться</h2>
    <div class="related-products-grid">
      <div
        v-for="relatedProduct in relatedProducts"
        :key="relatedProduct.id"
        class="product-card"
        @click="
          router.push(
            `/catalog/${
              relatedProduct.category_slug || categorySlug
            }/${generateProductSlug(relatedProduct)}`
          )
        "
      >
        <img
          :src="normalizeImagePath(relatedProduct.image)"
          :alt="relatedProduct.name ? String(relatedProduct.name) : ''"
        />
        <div class="product-card__content">
          <h3>{{ relatedProduct.name }}</h3>
          <div
            class="related-category extended-description-content"
            v-html="
              parseExtendedDescription(
                relatedProduct.description.slice(0, 32) + '...'
              )
            "
          ></div>
          <div class="related-price">
            {{
              relatedProduct.price
                .toLocaleString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
            }}
            &#8381;
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

interface ProductType {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category_slug: string;
  slug: string;
}

interface Props {
  relatedProducts: ProductType[];
  categorySlug: string;
}

const props = defineProps<Props>();
const router = useRouter();

const generateProductSlug = (product: ProductType): string => {
  if (!product || !product.name) return "";
  const name = product.name || "";
  return transliterate(name)
    .toLowerCase()
    .replace(/[\/\\]/g, "-")
    .replace(/[^a-z0-9\., -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/\.+/g, "-")
    .replace(/,+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(\d+)\.(\d+)/g, "$1-$2")
    .replace(/^-+|-+$/g, "");
};

const transliterate = (text: string | undefined): string => {
  if (!text) return "";
  const mapping: { [key: string]: string } = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
    А: "A",
    Б: "B",
    В: "V",
    Г: "G",
    Д: "D",
    Е: "E",
    Ё: "Yo",
    Ж: "Zh",
    З: "Z",
    И: "I",
    Й: "Y",
    К: "K",
    Л: "L",
    М: "M",
    Н: "N",
    О: "O",
    П: "P",
    Р: "R",
    С: "S",
    Т: "T",
    У: "U",
    Ф: "F",
    Х: "Kh",
    Ц: "Ts",
    Ч: "Ch",
    Ш: "Sh",
    Щ: "Sch",
    Ъ: "",
    Ы: "Y",
    Ь: "",
    Э: "E",
    Ю: "Yu",
    Я: "Ya",
  };
  return text
    .split("")
    .map((char) => mapping[char] || char)
    .join("");
};

// Добавляем функцию нормализации путей изображений
function normalizeImagePath(path: string | undefined): string {
  if (!path) return "/images/placeholders/placeholder.png";

  // Если путь уже начинается с /api/uploads/, оставляем как есть
  if (path.startsWith("/api/uploads/")) {
    return path;
  }

  // Если путь начинается с /uploads/, добавляем /api
  if (path.startsWith("/uploads/")) {
    return `/api${path}`;
  }

  // Если путь абсолютный (начинается с /), возвращаем как есть
  if (path.startsWith("/")) {
    return path;
  }

  // В остальных случаях предполагаем, что это относительный путь к uploads
  if (path.includes("uploads/")) {
    return `/api/${path}`;
  }

  return path;
}

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
.related-products-section {
  margin: 48px auto 0 auto;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 24px;
  text-align: center;
  color: #222;
}

.related-products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 80px;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: visible;
  transition: transform 0.25s, box-shadow 0.25s;
  position: relative;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-7px) scale(1.03);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.product-card img {
  position: absolute;
  top: -65px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 140px;
  object-fit: contain;
  z-index: 2;
  border-radius: 8px;
  background: transparent;
}

.product-card__content {
  padding: 32px 16px 16px 16px;
  text-align: center;
  position: relative;
  z-index: 1;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.product-card h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  font-weight: 700;
  color: #222;
}

.related-category {
  color: #888;
  font-size: 0.98rem;
  margin-bottom: 10px;
}

.related-price {
  color: #e31e24;
  font-size: 1.15rem;
  font-weight: bold;
  margin-bottom: 0;
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

@media (max-width: 1024px) {
  .related-products-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .related-products-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .product-card {
    min-height: 220px;
    padding-top: 40px;
  }

  .product-card img {
    width: 70px;
    height: 70px;
    top: -20px;
  }

  .product-card__content {
    padding: 16px 6px 8px 6px;
  }
}
</style>
