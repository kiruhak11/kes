<template>
  <div class="about-factory-section" v-scroll-reveal="'fade-in-up'">
    <div class="factory-menu" v-scroll-reveal="'fade-in-up'">
      <button
        v-for="tab in factoryTabs"
        :key="tab.key"
        :class="['factory-tab-btn', { active: activeFactoryTab === tab.key }]"
        @click="activeFactoryTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="factory-content" v-scroll-reveal="'fade-in-up'">
      <div v-if="activeFactoryTab === 'certificates'">
        <section class="certificates-gallery-section">
          <h2 class="certificates-gallery-title">Сертификаты и гарантии</h2>
          <p class="certificates-gallery-desc">
            Вся продукция сертифицирована и сопровождается гарантией
            завода-изготовителя.
          </p>
          <div class="cert-gallery-slider-wrap">
            <div class="cert-gallery-scroll">
              <div class="cert-gallery-track">
                <div
                  v-for="certificate in certificates"
                  :key="certificate.id"
                  class="cert-gallery-card"
                >
                  <div class="cert-gallery-img-wrap">
                    <img
                      :src="normalizeImagePath(certificate.image)"
                      :alt="certificate.title"
                    />
                  </div>
                  <div class="cert-gallery-title">
                    {{ certificate.title }}
                  </div>
                  <button
                    class="cert-gallery-btn"
                    @click="openCertificateModal(certificate)"
                  >
                    Просмотреть
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="cert-gallery-controls">
            <div
              class="cert-gallery-arrow cert-gallery-arrow-left"
              :class="{ disabled: galleryActiveIndex === 0 }"
              @click="scrollGalleryBy(-1)"
            >
              <svg width="32" height="32" viewBox="0 0 24 24">
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="#e31e24"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="cert-gallery-dots">
              <span
                v-for="(c, idx) in certificates"
                :key="idx"
                :class="[
                  'cert-gallery-dot',
                  { active: idx === galleryActiveIndex },
                ]"
                @click="scrollToGalleryCard(idx)"
              ></span>
            </div>
            <div
              class="cert-gallery-arrow cert-gallery-arrow-right"
              :class="{
                disabled: galleryActiveIndex === certificates.length - 1,
              }"
              @click="scrollGalleryBy(1)"
            >
              <svg width="32" height="32" viewBox="0 0 24 24">
                <path
                  d="M9 5l7 7-7 7"
                  stroke="#e31e24"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </section>
      </div>
      <div v-else-if="activeFactoryTab === 'about'">
        <div class="factory-about-block">
          <h3>О заводе</h3>
          <p>
            Наш завод — один из лидеров отрасли, производящий современные котлы
            и оборудование для промышленности и ЖКХ. Мы гордимся своей историей,
            инновациями и командой профессионалов.
          </p>
        </div>
      </div>
      <div v-else-if="activeFactoryTab === 'production'">
        <div class="factory-production-block">
          <h3>Производство</h3>
          <p>
            Современные производственные линии, строгий контроль качества,
            автоматизация и экологичность — всё это позволяет нам выпускать
            продукцию мирового уровня.
          </p>
        </div>
      </div>
      <div v-else-if="activeFactoryTab === 'team'">
        <div class="factory-team-block">
          <h3>Наша команда</h3>
          <p>
            В нашем коллективе работают инженеры, технологи, менеджеры и рабочие
            с многолетним опытом. Мы ценим каждого сотрудника и вместе достигаем
            новых высот!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

interface Certificate {
  id: number;
  title: string;
  image: string;
}

interface Props {
  certificates: Certificate[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  openCertificateModal: [certificate: Certificate];
}>();

const activeFactoryTab = ref("certificates");
const galleryActiveIndex = ref(0);
let trackInitTimer: number | undefined;
let trackEl: HTMLElement | null = null;
let scrollHandler: (() => void) | null = null;

const factoryTabs = [
  { key: "certificates", label: "Сертификаты" },
  { key: "about", label: "О заводе" },
  { key: "production", label: "Производство" },
  { key: "team", label: "Команда" },
];

const openCertificateModal = (certificate: Certificate) => {
  emit("openCertificateModal", certificate);
};

function scrollToGalleryCard(idx: number) {
  const scrollContainer = document.querySelector(".cert-gallery-scroll");
  const track = document.querySelector(".cert-gallery-track");
  if (scrollContainer && track) {
    const maxScroll = track.scrollWidth - scrollContainer.clientWidth;
    const dotsCount = props.certificates.length;
    let scrollLeft = 0;
    if (dotsCount > 1) {
      scrollLeft = (maxScroll * idx) / (dotsCount - 1);
    }
    scrollContainer.scrollTo({ left: scrollLeft, behavior: "smooth" });
    galleryActiveIndex.value = idx;
  }
}

function scrollGalleryBy(delta: number) {
  let newIdx = galleryActiveIndex.value + delta;
  newIdx = Math.max(0, Math.min(props.certificates.length - 1, newIdx));
  scrollToGalleryCard(newIdx);
}

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

onMounted(() => {
  trackInitTimer = window.setTimeout(() => {
    trackEl = document.querySelector(".cert-gallery-track") as HTMLElement | null;
    if (!trackEl) return;

    scrollHandler = () => {
      const cards = Array.from(trackEl!.children) as HTMLElement[];
      let minDiff = Infinity;
      let activeIdx = 0;
      cards.forEach((card, idx) => {
        const diff = Math.abs(trackEl!.scrollLeft - card.offsetLeft);
        if (diff < minDiff) {
          minDiff = diff;
          activeIdx = idx;
        }
      });
      galleryActiveIndex.value = activeIdx;
    };

    trackEl.addEventListener("scroll", scrollHandler, { passive: true });
  }, 500);
});

onUnmounted(() => {
  if (trackInitTimer) {
    clearTimeout(trackInitTimer);
  }
  if (trackEl && scrollHandler) {
    trackEl.removeEventListener("scroll", scrollHandler);
  }
});
</script>

<style scoped lang="scss">
.about-factory-section {
  display: flex;
  gap: 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin: 48px 0;
  padding: 32px 24px;
  min-height: unset !important;
  height: auto !important;
}

.factory-menu {
  flex: 0 0 18%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-right: 2px solid #f0f0f0;
  padding-right: 18px;
}

.factory-tab-btn {
  background: none;
  border: none;
  font-size: 1.08rem;
  font-weight: 600;
  color: #888;
  padding: 14px 10px;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, color 0.2s;
}

.factory-tab-btn.active {
  background: #f7f7fa;
  color: #e31e24;
}

.factory-content {
  flex: 1 1 82%;
  padding-left: 32px;
  min-width: 0;
  overflow: visible;
}

.certificates-gallery-section {
  position: relative;
  z-index: 1;
  overflow: visible;
  padding-bottom: 0;
  padding-top: 0;
  margin-bottom: 0;
  text-align: left;
}

.certificates-gallery-title {
  margin-top: 0;
  margin-bottom: 8px;
  text-align: left;
}

.certificates-gallery-desc {
  margin-bottom: 16px;
  text-align: left;
}

.cert-gallery-slider-wrap {
  width: 100%;
  max-width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  padding-bottom: 0;
  margin-top: 0 !important;
  margin-bottom: 0;
}

.cert-gallery-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-top: 18px;
  user-select: none;
  height: 48px;
}

.cert-gallery-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  position: static;
  background: #fff;
  border: 2px solid #e31e24;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(227, 30, 36, 0.07);
  font-size: 1.2rem;
  transition: background 0.2s, border 0.2s, opacity 0.2s;
  opacity: 0.92;
  pointer-events: auto;
  margin: 0;
}

.cert-gallery-arrow.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

.cert-gallery-arrow:hover:not(.disabled) {
  background: #fff6f6;
  border-color: #ff6b6b;
}

.cert-gallery-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0;
  margin-bottom: 0;
  scrollbar-width: none;
  overflow-y: visible;
}

.cert-gallery-scroll::-webkit-scrollbar {
  display: none;
}

.cert-gallery-track {
  display: flex;
  gap: 28px;
  margin-top: 64px;
  width: max-content;
  min-width: 100%;
  padding-bottom: 0;
  overflow: visible;
  flex-wrap: nowrap;
}

.cert-gallery-card {
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 6px 32px rgba(227, 30, 36, 0.1);
  min-width: 240px;
  max-width: 260px;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 32px 12px 16px 12px;
  position: relative;
  transition: box-shadow 0.25s, transform 0.25s, opacity 0.25s;
  opacity: 0.98;
  border: 1.5px solid #f3eaea;
  z-index: 10;
  flex-shrink: 0;
}

.cert-gallery-card:hover {
  box-shadow: 0 16px 48px 0 rgba(227, 30, 36, 0.18),
    0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-10px) scale(1.04);
  opacity: 1;
  border-color: #ffeaea;
  z-index: 10;
}

.cert-gallery-img-wrap {
  position: absolute;
  top: -38px;
  left: 50%;
  transform: translateX(-50%);
  width: 72px;
  height: 72px;
  background: #fff6f6;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(227, 30, 36, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  border: 2px solid #e31e24;
  z-index: 20;
}

.cert-gallery-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cert-gallery-title {
  font-size: 1.02rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 10px;
  margin-top: 44px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: normal;
  max-height: 2.6em;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.cert-gallery-btn {
  background: linear-gradient(45deg, #e31e24, #ff4d4d);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 7px 18px;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(227, 30, 36, 0.1);
  transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  margin-top: auto;
}

.cert-gallery-btn:hover {
  background: linear-gradient(45deg, #ff4d4d, #e31e24);
}

.cert-gallery-dots {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 100%;
}

.cert-gallery-dot {
  width: 18px;
  height: 10px;
  border-radius: 8px;
  background: #fff;
  border: 2px solid #e31e24;
  box-shadow: 0 2px 8px rgba(227, 30, 36, 0.1);
  transition: background 0.35s, transform 0.35s, border 0.35s, width 0.35s,
    box-shadow 0.35s;
  cursor: pointer;
  opacity: 0.7;
  position: relative;
  margin: 0;
  vertical-align: middle;
}

.cert-gallery-dot:hover {
  opacity: 1;
  border-color: #ff6b6b;
  box-shadow: 0 0 12px #e31e24;
}

.cert-gallery-dot.active {
  width: 36px;
  background: linear-gradient(90deg, #e31e24 60%, #ff6b6b 100%);
  border-color: #ff6b6b;
  box-shadow: 0 0 16px #e31e24, 0 2px 8px rgba(227, 30, 36, 0.13);
  opacity: 1;
  transform: scale(1.18);
}

.factory-about-block,
.factory-production-block,
.factory-team-block {
  h3 {
    font-size: 1.5rem;
    margin-bottom: 16px;
    color: #e31e24;
    font-weight: 600;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #333;
  }
}

@media (max-width: 900px) {
  .cert-gallery-arrow {
    width: 32px;
    height: 32px;
  }
  .cert-gallery-controls {
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .cert-gallery-arrow {
    width: 24px;
    height: 24px;
  }
  .cert-gallery-controls {
    gap: 6px;
  }
}

@media (max-width: 768px) {
  .about-factory-section {
    flex-direction: column;
    gap: 24px;
    padding: 24px 12px;
  }

  .factory-menu {
    flex-direction: row;
    border-right: none;
    border-bottom: 2px solid #f0f0f0;
    padding-right: 0;
    padding-bottom: 12px;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .factory-menu::-webkit-scrollbar {
    display: none;
  }

  .factory-tab-btn {
    flex-shrink: 0;
    white-space: nowrap;
    font-size: 0.95rem;
    padding: 10px 16px;
  }

  .factory-content {
    padding-left: 0;
    padding-top: 12px;
  }
}
</style>
