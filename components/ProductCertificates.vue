<template>
  <div
    v-if="activeTab === 'certificates'"
    class="section-block certificates-block"
    v-scroll-reveal="'fade-in-up'"
  >
    <h2 class="section-title">Сертификаты и гарантии</h2>
    <div class="cert-gallery-slider-wrap">
      <div class="cert-gallery-scroll">
        <div class="cert-gallery-track">
          <div
            v-for="certificate in certificates"
            :key="certificate.id"
            class="cert-gallery-card"
          >
            <div class="cert-gallery-img-wrap">
              <img :src="certificate.image" :alt="certificate.title" />
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
          :class="['cert-gallery-dot', { active: idx === galleryActiveIndex }]"
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Certificate {
  id: number;
  title: string;
  image: string;
}

interface Props {
  activeTab: string;
  certificates: Certificate[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  openCertificateModal: [certificate: Certificate];
}>();

const galleryActiveIndex = ref(0);

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

onMounted(() => {
  setTimeout(() => {
    const track = document.querySelector(".cert-gallery-track");
    if (track) {
      track.addEventListener("scroll", () => {
        const cards = Array.from(track.children) as HTMLElement[];
        let minDiff = Infinity;
        let activeIdx = 0;
        cards.forEach((card, idx) => {
          const diff = Math.abs((track.scrollLeft || 0) - card.offsetLeft);
          if (diff < minDiff) {
            minDiff = diff;
            activeIdx = idx;
          }
        });
        galleryActiveIndex.value = activeIdx;
      });
    }
  }, 500);
});
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

.certificates-block {
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
  transition: all 0.3s;
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
  .section-block {
    padding: 16px 12px;
  }

  .section-title {
    font-size: 1.2rem;
  }
}
</style>
