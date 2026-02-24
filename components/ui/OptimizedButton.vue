<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="button__loader">
      <div class="button__spinner"></div>
    </span>
    <span v-else class="button__content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThrottle } from '~/composables/useDebounce'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  throttle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  throttle: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { throttle } = useThrottle(300)

const buttonClasses = computed(() => [
  'button',
  `button--${props.variant}`,
  `button--${props.size}`,
  {
    'button--disabled': props.disabled,
    'button--loading': props.loading,
  },
])

const handleClick = props.throttle
  ? throttle((event: MouseEvent) => {
      if (!props.disabled && !props.loading) {
        emit('click', event)
      }
    })
  : (event: MouseEvent) => {
      if (!props.disabled && !props.loading) {
        emit('click', event)
      }
    }
</script>

<style lang="scss" scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease,
    border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease,
    opacity 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  // Размеры
  &--sm {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  &--md {
    padding: 12px 16px;
    font-size: 16px;
  }
  
  &--lg {
    padding: 16px 24px;
    font-size: 18px;
  }
  
  // Варианты
  &--primary {
    background: var(--primary-color);
    color: #fff;
    
    &:hover:not(:disabled) {
      background: var(--primary-hover);
    }
  }
  
  &--secondary {
    background: var(--bg-light);
    color: var(--text-color);
    
    &:hover:not(:disabled) {
      background: var(--border-color);
    }
  }
  
  &--outline {
    background: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
    
    &:hover:not(:disabled) {
      background: var(--primary-color);
      color: #fff;
    }
  }
  
  &--ghost {
    background: transparent;
    color: var(--text-color);
    
    &:hover:not(:disabled) {
      background: var(--bg-light);
    }
  }
  
  // Состояние загрузки
  &--loading {
    pointer-events: none;
  }
  
  &__loader {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  &__content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
