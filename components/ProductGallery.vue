<template>
  <div
    class="product-gallery"
    :class="{ 'no-reveal': isMobile }"
    v-scroll-reveal="!isMobile && 'slide-in-left'"
  >
    <!-- Основное изображение -->
    <div class="main-image-container">
      <button
        v-if="imageList.length > 1"
        class="gallery-nav prev"
        @click="prevImage"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <img
        :src="imageList[currentImageIndex]"
        :alt="productName"
        class="main-image"
        loading="eager"
      />
      <button
        v-if="imageList.length > 1"
        class="gallery-nav next"
        @click="nextImage"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Миниатюры -->
    <div v-if="imageList.length > 1" class="thumbnails-container">
      <div class="thumbnails-scroll">
        <button
          v-for="(img, idx) in imageList"
          :key="idx"
          :class="['thumbnail-btn', { active: idx === currentImageIndex }]"
          @click="currentImageIndex = idx"
        >
          <img
            :src="img"
            :alt="`${productName} - изображение ${idx + 1}`"
            :loading="idx < 3 ? 'eager' : 'lazy'"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  imageList: string[];
  productName: string;
  isMobile: boolean;
}

const props = defineProps<Props>();

// Текущий индекс изображения
const currentImageIndex = ref(0);

// Сброс индекса при изменении продукта
watch(
  () => props.imageList,
  () => {
    currentImageIndex.value = 0;
  }
);

// Навигация по галерее
const nextImage = () => {
  if (currentImageIndex.value < props.imageList.length - 1) {
    currentImageIndex.value++;
  } else {
    currentImageIndex.value = 0;
  }
};

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  } else {
    currentImageIndex.value = props.imageList.length - 1;
  }
};
</script>

<style scoped lang="scss">
.product-gallery {
  flex: 0 0 50%;
  max-width: 50%;
  padding: 1rem;

  // Добавляем стили для основного изображения в десктопной версии
  .main-image-container {
    position: relative;
    width: 100%;
    height: 400px;
    border-radius: 12px;
    overflow: hidden;
    background: #f8f9fa;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;

    .main-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 1rem;
      transition: transform 0.3s ease;
    }

    .gallery-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &:hover {
        background: rgba(255, 255, 255, 1);
        transform: translateY(-50%) scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      &.prev {
        left: 12px;
      }

      &.next {
        right: 12px;
      }

      i {
        color: #333;
        font-size: 1.2rem;
      }
    }
  }

  // Стили для миниатюр
  .thumbnails-container {
    margin-top: 1rem;

    .thumbnails-scroll {
      display: flex;
      gap: 0.75rem;
      overflow-x: auto;
      padding: 0.25rem 0;
      scrollbar-width: thin;
      scrollbar-color: #ccc transparent;

      &::-webkit-scrollbar {
        height: 4px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 2px;
      }

      .thumbnail-btn {
        flex: 0 0 80px;
        height: 80px;
        border: 2px solid transparent;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s ease;
        background: #f8f9fa;

        &:hover {
          border-color: #e31e24;
          transform: scale(1.05);
        }

        &.active {
          border-color: #e31e24;
          box-shadow: 0 2px 8px rgba(227, 30, 36, 0.2);
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 0.5rem;
        }
      }
    }
  }

  @media (max-width: 1024px) {
    flex: 0 0 100%;
    max-width: 100%;
    padding: 0;

    .main-image-container {
      margin: 0;
      border-radius: 8px;
      overflow: hidden;
      background: var(--bg-light);
      height: 350px;

      img.main-image {
        height: 100%;
        width: 100%;
        object-fit: contain;
        padding: 0;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 0;
    margin-bottom: 1rem;

    .main-image-container {
      margin: 0;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      height: 250px;

      img.main-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        padding: 1rem;
      }

      .gallery-nav {
        width: 36px;
        height: 36px;

        &.prev {
          left: 8px;
        }

        &.next {
          right: 8px;
        }
      }
    }

    .thumbnails-container {
      margin-top: 0.75rem;

      .thumbnails-scroll {
        gap: 0.5rem;
        padding: 0.25rem 0;

        .thumbnail-btn {
          flex: 0 0 64px;
          height: 64px;
          border-width: 1px;

          &.active {
            border-width: 2px;
          }

          img {
            padding: 0.25rem;
          }
        }
      }
    }
  }
}

// Добавляем стили для мобильной версии
.no-reveal {
  opacity: 1 !important;
  transform: none !important;
  visibility: visible !important;
}
</style>
