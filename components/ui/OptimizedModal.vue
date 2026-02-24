<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="modal-overlay"
        @click="handleOverlayClick"
      >
        <div
          ref="modalRef"
          class="modal"
          :class="modalClasses"
          @click.stop
        >
          <div class="modal__header">
            <h3 v-if="title" class="modal__title">{{ title }}</h3>
            <button
              v-if="showClose"
              class="modal__close"
              @click="handleClose"
              aria-label="Закрыть"
            >
              <span class="modal__close-icon">&times;</span>
            </button>
          </div>
          
          <div class="modal__content">
            <slot />
          </div>
          
          <div v-if="$slots.footer" class="modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showClose?: boolean
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showClose: true,
  closeOnOverlay: true,
  closeOnEscape: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const modalRef = ref<HTMLElement | null>(null)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const modalClasses = computed(() => [
  'modal',
  `modal--${props.size}`,
])

const handleClose = () => {
  isOpen.value = false
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleClose()
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape && isOpen.value) {
    handleClose()
  }
}

// Блокировка скролла при открытом модале
const blockScroll = () => {
  document.body.style.overflow = 'hidden'
}

const unblockScroll = () => {
  document.body.style.overflow = ''
}

// Фокус на модал при открытии
const focusModal = () => {
  if (modalRef.value) {
    const focusableElements = modalRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  unblockScroll()
})

watch(isOpen, (newValue) => {
  if (newValue) {
    blockScroll()
    nextTick(() => {
      focusModal()
    })
  } else {
    unblockScroll()
  }
})
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  // Размеры
  &--sm {
    width: 400px;
  }
  
  &--md {
    width: 600px;
  }
  
  &--lg {
    width: 800px;
  }
  
  &--xl {
    width: 1000px;
  }
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-color);
  }
  
  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
  
  &__close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
    
    &:hover {
      background: var(--bg-light);
    }
  }
  
  &__content {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }
  
  &__footer {
    padding: 20px 24px;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}

// Анимации
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

// Responsive
@media (max-width: 768px) {
  .modal {
    width: 100% !important;
    max-width: 100vw;
    margin: 0;
    border-radius: 0;
    height: 100vh;
  }
  
  .modal-overlay {
    padding: 0;
  }
}
</style>
