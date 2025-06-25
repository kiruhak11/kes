<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div 
        v-if="isVisible" 
        class="certificate-modal-overlay"
        @click="handleOverlayClick"
        @keydown.escape="closeModal"
        tabindex="0"
      >
        <div 
          class="certificate-modal"
          :class="{ 'certificate-modal--fullscreen': isFullscreen }"
          @click.stop
        >
          <!-- Header -->
          <header class="modal-header">
            <div class="modal-header__content">
              <h2 class="modal-title">{{ certificate?.title.slice(0, 28) + '...' }}</h2>
              <div class="modal-controls">
                <button 
                  @click="toggleFullscreen"
                  class="modal-control-btn"
                  :title="isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'"
                  type="button"
                >
                  <svg v-if="!isFullscreen" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M8 21H5C3.89543 21 3 20.1046 3 19V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3V8H3M16 3V8H21M16 21V16H21M8 21V16H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button 
                  @click="downloadImage"
                  class="modal-control-btn"
                  title="Скачать изображение"
                  type="button"
                  :disabled="!imageLoaded || imageError"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button 
                  @click="closeModal"
                  class="modal-control-btn modal-close-btn"
                  title="Закрыть"
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </header>

          <!-- Body -->
          <div class="modal-body">
            <div 
              class="modal-image-container" 
              :class="{ 
                'modal-image-container--zoomed': isZoomed,
                'modal-image-container--loading': !imageLoaded 
              }"
              @click="toggleZoom"
              @wheel="handleWheel"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
            >
              <img 
                v-if="certificate?.image"
                :src="certificate.image" 
                :alt="certificate.title"
                class="modal-image"
                :class="{ 'modal-image--zoomed': isZoomed }"
                @load="handleImageLoad"
                @error="handleImageError"
                draggable="false"
                ref="imageRef"
              />
              
              <!-- Loading State -->
              <div v-if="!imageLoaded && !imageError" class="modal-loading">
                <div class="spinner"></div>
                <span class="loading-text">Загрузка изображения...</span>
                <div class="loading-progress" v-if="loadingProgress > 0">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: `${loadingProgress}%` }"></div>
                  </div>
                  <span class="progress-text">{{ Math.round(loadingProgress) }}%</span>
                </div>
              </div>
              
              <!-- Error State -->
              <div v-if="imageError" class="modal-error">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="error-text">Ошибка загрузки изображения</span>
                <button @click="retryLoad" class="retry-btn">Повторить</button>
              </div>
              
              <!-- Zoom Hint -->
              <div v-if="isZoomed" class="modal-zoom-hint">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5ZM10.5 7V14M7 10.5H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Кликните для уменьшения</span>
              </div>

              <!-- Navigation Arrows -->
              <button 
                v-if="canNavigatePrevious"
                @click="handlePrevious"
                class="modal-nav-arrow modal-nav-arrow--left"
                title="Предыдущий сертификат"
                type="button"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              
              <button 
                v-if="canNavigateNext"
                @click="handleNext"
                class="modal-nav-arrow modal-nav-arrow--right"
                title="Следующий сертификат"
                type="button"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Footer -->
          <footer class="modal-footer">
            <div class="modal-navigation">
              <button 
                @click="handlePrevious"
                class="modal-nav-btn"
                :disabled="!canNavigatePrevious"
                :title="!canNavigatePrevious ? 'Это первый сертификат' : 'Предыдущий сертификат'"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="nav-text">Предыдущий</span>
              </button>
              
              <div class="modal-counter">
                <span class="counter-text">{{ currentIndex + 1 }} из {{ totalCount }}</span>
              </div>
              
              <button 
                @click="handleNext"
                class="modal-nav-btn"
                :disabled="!canNavigateNext"
                :title="!canNavigateNext ? 'Это последний сертификат' : 'Следующий сертификат'"
                type="button"
              >
                <span class="nav-text">Следующий</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

interface Certificate {
  id: number
  title: string
  image: string
}

interface Props {
  certificate: Certificate | null
  currentIndex: number
  totalCount: number
  onPrevious?: () => void
  onNext?: () => void
  onClose?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  onPrevious: undefined,
  onNext: undefined,
  onClose: undefined
})

// Reactive state
const isVisible = ref(false)
const isFullscreen = ref(false)
const isZoomed = ref(false)
const imageLoaded = ref(false)
const imageError = ref(false)
const loadingProgress = ref(0)
const imageRef = ref<HTMLImageElement | null>(null)

// Touch handling for mobile
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)

// Computed
const canNavigatePrevious = computed(() => props.currentIndex > 0)
const canNavigateNext = computed(() => props.currentIndex < props.totalCount - 1)

// Methods
const handleOverlayClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  // Обновляем стили body
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const toggleZoom = () => {
  if (!imageLoaded.value || imageError.value) return
  isZoomed.value = !isZoomed.value
}

const handleWheel = (event: WheelEvent) => {
  if (!imageLoaded.value || imageError.value) return
  
  event.preventDefault()
  
  if (event.deltaY < 0) {
    // Zoom in
    if (!isZoomed.value) {
      isZoomed.value = true
    }
  } else {
    // Zoom out
    if (isZoomed.value) {
      isZoomed.value = false
    }
  }
}

// Touch handlers for mobile navigation
const handleTouchStart = (event: TouchEvent) => {
  touchStartX.value = event.touches[0].clientX
  touchStartY.value = event.touches[0].clientY
}

const handleTouchMove = (event: TouchEvent) => {
  if (isZoomed.value) return // Don't handle swipe when zoomed
  
  touchEndX.value = event.touches[0].clientX
  touchEndY.value = event.touches[0].clientY
}

const handleTouchEnd = () => {
  if (isZoomed.value) return
  
  const diffX = touchStartX.value - touchEndX.value
  const diffY = touchStartY.value - touchEndY.value
  
  // Minimum swipe distance
  const minSwipeDistance = 50
  
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
    if (diffX > 0 && canNavigateNext.value) {
      // Swipe left - next
      handleNext()
    } else if (diffX < 0 && canNavigatePrevious.value) {
      // Swipe right - previous
      handlePrevious()
    }
  }
}

const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
  loadingProgress.value = 100
}

const handleImageError = () => {
  imageLoaded.value = false
  imageError.value = true
  loadingProgress.value = 0
}

const retryLoad = () => {
  imageError.value = false
  imageLoaded.value = false
  loadingProgress.value = 0
  
  // Принудительно перезагружаем изображение
  nextTick(() => {
    if (imageRef.value) {
      imageRef.value.src = imageRef.value.src
    }
  })
}

const downloadImage = async () => {
  if (!props.certificate?.image || !imageLoaded.value || imageError.value) return
  
  try {
    const response = await fetch(props.certificate.image)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${props.certificate.title.replace(/[^a-zA-Zа-яА-Я0-9\s]/g, '')}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Ошибка при скачивании изображения:', error)
  }
}

const handlePrevious = () => {
  if (canNavigatePrevious.value && props.onPrevious) {
    resetModalState()
    props.onPrevious()
  }
}

const handleNext = () => {
  if (canNavigateNext.value && props.onNext) {
    resetModalState()
    props.onNext()
  }
}

const closeModal = () => {
  if (props.onClose) {
    props.onClose()
  }
}

const resetModalState = () => {
  imageLoaded.value = false
  imageError.value = false
  isZoomed.value = false
  loadingProgress.value = 0
}

// Simulate loading progress
const simulateLoadingProgress = () => {
  if (!imageLoaded.value && !imageError.value) {
    const interval = setInterval(() => {
      if (loadingProgress.value < 90) {
        loadingProgress.value += Math.random() * 10
      }
      if (imageLoaded.value || imageError.value) {
        clearInterval(interval)
      }
    }, 100)
  }
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.certificate) return
  
  switch (event.key) {
    case 'Escape':
      closeModal()
      break
    case 'ArrowLeft':
      if (canNavigatePrevious.value) {
        handlePrevious()
      }
      break
    case 'ArrowRight':
      if (canNavigateNext.value) {
        handleNext()
      }
      break
    case 'f':
    case 'F':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        toggleFullscreen()
      }
      break
    case ' ':
    case 'Enter':
      event.preventDefault()
      toggleZoom()
      break
  }
}

// Watchers
watch(() => props.certificate, () => {
  resetModalState()
  simulateLoadingProgress()
}, { immediate: true })

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  isVisible.value = true
  
  // Блокируем прокрутку страницы
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  
  // Восстанавливаем прокрутку страницы
  document.body.style.overflow = ''
})

// Expose methods for template
defineExpose({
  closeModal,
  downloadImage,
  handlePrevious,
  handleNext,
  handleImageLoad,
  handleImageError,
  retryLoad,
  handleTouchEnd
})
</script>

<style lang="scss" scoped>
// Variables
$primary-color: #e31e24;
$primary-hover: #c41820;
$bg-overlay: rgba(0, 0, 0, 0.85);
$bg-modal: #ffffff;
$border-color: #e0e0e0;
$text-primary: #333333;
$text-secondary: #666666;
$shadow-modal: 0 20px 60px rgba(0, 0, 0, 0.3);
$shadow-control: 0 4px 12px rgba(0, 0, 0, 0.15);
$border-radius: 16px;
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

// Modal Overlay
.certificate-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: $bg-overlay;
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
  outline: none;
}

// Modal Container
.certificate-modal {
  background: $bg-modal;
  border-radius: $border-radius;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-width: 90vw;
  max-height: 90vh;
  min-width: 400px;
  box-shadow: $shadow-modal;
  position: relative;
  
  &--fullscreen {
    max-width: 100vw;
    max-height: 100vh;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
}

// Header
.modal-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid $border-color;
  padding: 0;
  
  &__content {
    padding: 24px 32px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
}

.modal-title {
  font-size: 1.5rem;
  color: $text-primary;
  margin: 0;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  line-height: 1.3;
}

.modal-controls {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.modal-control-btn {
  background: rgba($primary-color, 0.1);
  border: 1px solid rgba($primary-color, 0.2);
  color: $primary-color;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: $transition;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background: $primary-color;
    color: white;
    transform: translateY(-2px);
    box-shadow: $shadow-control;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  &.modal-close-btn:hover:not(:disabled) {
    background: #dc3545;
    border-color: #dc3545;
  }
}

// Body
.modal-body {
  flex: 1;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  position: relative;
  overflow: hidden;
  background: #fafafa;
}

.modal-image-container {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  cursor: zoom-in;
  border-radius: 12px;
  overflow: hidden;
  transition: $transition;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  &--zoomed {
    cursor: zoom-out;
  }
  
  &--loading {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.modal-image {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  width: auto;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
  transition: $transition;
  
  &--zoomed {
    transform: scale(1.5);
    cursor: zoom-out;
  }
}

// Navigation Arrows
.modal-nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: $transition;
  z-index: 10;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: translateY(-50%) scale(1.1);
  }
  
  &--left {
    left: 20px;
  }
  
  &--right {
    right: 20px;
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    
    &--left {
      left: 10px;
    }
    
    &--right {
      right: 10px;
    }
  }
}

// Loading State
.modal-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  color: $text-secondary;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 14px;
  font-weight: 500;
}

.loading-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 200px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $primary-color;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 500;
  color: $text-secondary;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Error State
.modal-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  color: $text-secondary;
  gap: 16px;
  padding: 20px;
}

.error-text {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.retry-btn {
  background: $primary-color;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: $transition;
  
  &:hover {
    background: $primary-hover;
    transform: translateY(-2px);
  }
}

// Zoom Hint
.modal-zoom-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  backdrop-filter: blur(8px);
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

// Footer
.modal-footer {
  background: #f8f9fa;
  border-top: 1px solid $border-color;
  padding: 20px 32px;
}

.modal-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.modal-nav-btn {
  background: $primary-color;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: $transition;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 14px;
  
  &:hover:not(:disabled) {
    background: $primary-hover;
    transform: translateY(-2px);
    box-shadow: $shadow-control;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}

.nav-text {
  @media (max-width: 768px) {
    display: none;
  }
}

.modal-counter {
  display: flex;
  align-items: center;
  justify-content: center;
}

.counter-text {
  font-weight: 600;
  color: $text-secondary;
  font-size: 14px;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid $border-color;
}

// Transitions
.modal-enter-active,
.modal-leave-active {
  transition: $transition;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

// Responsive Design
@media (max-width: 768px) {
  .certificate-modal-overlay {
    padding: 10px;
  }
  
  .certificate-modal {
    min-width: 300px;
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .modal-header__content {
    padding: 16px 20px 12px;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .modal-title {
    font-size: 1.2rem;
    text-align: center;
  }
  
  .modal-controls {
    justify-content: center;
  }
  
  .modal-control-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .modal-body {
    padding: 20px;
    min-height: 300px;
  }
  
  .modal-image {
    max-width: 100%;
    max-height: 50vh;
    
    &--zoomed {
      transform: scale(1.2);
    }
  }
  
  .modal-footer {
    padding: 16px 20px;
  }
  
  .modal-navigation {
    flex-direction: column;
    gap: 12px;
  }
  
  .modal-nav-btn {
    width: 100%;
    justify-content: center;
    padding: 10px 16px;
  }
  
  .modal-counter {
    order: -1;
  }
  
  .modal-zoom-hint {
    bottom: 10px;
    padding: 8px 16px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .certificate-modal-overlay {
    padding: 5px;
  }
  
  .certificate-modal {
    min-width: 280px;
    max-width: 98vw;
    max-height: 98vh;
  }
  
  .modal-header__content {
    padding: 12px 16px 8px;
  }
  
  .modal-title {
    font-size: 1.1rem;
  }
  
  .modal-body {
    padding: 16px;
    min-height: 250px;
  }
  
  .modal-footer {
    padding: 12px 16px;
  }
}
</style> 