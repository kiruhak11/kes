<template>
  <div class="gallery-container">
    <h1 class="gallery-title">Фотогалерея</h1>
    
    <div class="gallery-categories">
      <button 
        v-for="category in categories" 
        :key="category"
        :class="['category-btn', { active: selectedCategory === category }]"
        @click="selectedCategory = category"
      >
        {{ category }}
      </button>
    </div>

    <div class="gallery-grid">
      <div 
        v-for="(image, index) in filteredImages" 
        :key="index"
        class="gallery-card"
        @click="openLightbox(index)"
      >
        <img :src="image.path" :alt="image.name" class="gallery-image">
        <div class="gallery-content">
          <h3 class="gallery-card-title">{{ image.name }}</h3>
          <p class="gallery-card-description">{{ image.category }}</p>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <div v-if="showLightbox" class="lightbox" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <button class="lightbox-close" @click="closeLightbox">&times;</button>
        <button class="lightbox-nav prev" @click="prevImage">&lt;</button>
        <img :src="currentImage.path" :alt="currentImage.name" class="lightbox-image">
        <button class="lightbox-nav next" @click="nextImage">&gt;</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Состояние
const selectedCategory = ref('Все')
const showLightbox = ref(false)
const currentImageIndex = ref(0)

// Категории изображений
const categories = ref([
  'Все',
  'Услуги',
  'Каталог',
  'О нас',
  'Герои'
])

// Список всех изображений
const images = ref([
  // Услуги
  {
    path: '/images/services/design.jpg',
    name: 'Проектирование',
    category: 'Услуги'
  },
  {
    path: '/images/services/installation.jpg',
    name: 'Монтаж',
    category: 'Услуги'
  },
  {
    path: '/images/services/startup.jpg',
    name: 'Пусконаладка',
    category: 'Услуги'
  },
  {
    path: '/images/services/turnkey.jpg',
    name: 'Под ключ',
    category: 'Услуги'
  },

  // Каталог
  {
    path: '/images/catalog/automation.jpg',
    name: 'Автоматизация',
    category: 'Каталог'
  },
  {
    path: '/images/catalog/cyclones.jpg',
    name: 'Циклоны',
    category: 'Каталог'
  },
  {
    path: '/images/catalog/fans.jpg',
    name: 'Вентиляторы',
    category: 'Каталог'
  },
  {
    path: '/images/catalog/fuel-supply.jpg',
    name: 'Топливоподача',
    category: 'Каталог'
  },
  {
    path: '/images/catalog/furnaces.jpg',
    name: 'Печи',
    category: 'Каталог'
  },
  {
    path: '/images/catalog/grids.jpg',
    name: 'Решетки',
    category: 'Каталог'
  },
  {
    path: '/images/catalog/skip-hoists.jpg',
    name: 'Скиповые подъемники',
    category: 'Каталог'
  },
  {
    path: '/images/catalog/steam.jpg',
    name: 'Пар',
    category: 'Каталог'
  },
  {
    path: '/images/catalog/water-heating.jpg',
    name: 'Водонагрев',
    category: 'Каталог'
  },

  // О нас
  {
    path: '/images/about/boiler-room.jpg',
    name: 'Котельная',
    category: 'О нас'
  },
  {
    path: '/images/about/tour.jpg',
    name: 'Экскурсия',
    category: 'О нас'
  },

  // Герои
  {
    path: '/images/hero1.jpg',
    name: 'Герой 1',
    category: 'Герои'
  },
  {
    path: '/images/hero2.png',
    name: 'Герой 2',
    category: 'Герои'
  },
  {
    path: '/images/hero3.png',
    name: 'Герой 3',
    category: 'Герои'
  },
  {
    path: '/images/hero4.png',
    name: 'Герой 4',
    category: 'Герои'
  }
])

// Фильтрация изображений по выбранной категории
const filteredImages = computed(() => {
  if (selectedCategory.value === 'Все') {
    return images.value
  }
  return images.value.filter(img => img.category === selectedCategory.value)
})

// Текущее изображение для лайтбокса
const currentImage = computed(() => filteredImages.value[currentImageIndex.value])

// Методы для лайтбокса
const openLightbox = (index) => {
  currentImageIndex.value = index
  showLightbox.value = true
}

const closeLightbox = () => {
  showLightbox.value = false
}

const prevImage = () => {
  currentImageIndex.value = (currentImageIndex.value - 1 + filteredImages.value.length) % filteredImages.value.length
}

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % filteredImages.value.length
}

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.gallery-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.gallery-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.gallery-categories {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  background: #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-btn:hover {
  background: #e0e0e0;
}

.category-btn.active {
  background: #007bff;
  color: white;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.gallery-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.gallery-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gallery-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.gallery-content {
  padding: 1.5rem;
}

.gallery-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.gallery-card-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Lightbox styles */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
}

.lightbox-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 1rem;
  cursor: pointer;
  font-size: 1.5rem;
  border-radius: 50%;
}

.lightbox-nav.prev {
  left: -60px;
}

.lightbox-nav.next {
  right: -60px;
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .gallery-image {
    height: 200px;
  }

  .lightbox-nav {
    padding: 0.5rem;
    font-size: 1.2rem;
  }

  .lightbox-nav.prev {
    left: -40px;
  }

  .lightbox-nav.next {
    right: -40px;
  }
}
</style>