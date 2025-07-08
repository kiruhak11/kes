<template>
  <div
    :class="cardClasses"
    :style="cardStyles"
  >
    <div v-if="$slots.header" class="card__header">
      <slot name="header" />
    </div>
    
    <div class="card__content">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  clickable?: boolean
  shadow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hover: false,
  clickable: false,
  shadow: true,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const cardClasses = computed(() => [
  'card',
  `card--${props.variant}`,
  `card--padding-${props.padding}`,
  {
    'card--hover': props.hover,
    'card--clickable': props.clickable,
    'card--shadow': props.shadow,
  },
])

const cardStyles = computed(() => ({
  cursor: props.clickable ? 'pointer' : 'default',
}))

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
.card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  
  // Варианты
  &--default {
    border: 1px solid var(--border-color);
  }
  
  &--elevated {
    border: none;
  }
  
  &--outlined {
    border: 2px solid var(--border-color);
    background: transparent;
  }
  
  // Отступы
  &--padding-none {
    .card__content {
      padding: 0;
    }
  }
  
  &--padding-sm {
    .card__content {
      padding: 12px;
    }
  }
  
  &--padding-md {
    .card__content {
      padding: 16px;
    }
  }
  
  &--padding-lg {
    .card__content {
      padding: 24px;
    }
  }
  
  // Состояния
  &--hover {
    &:hover {
      transform: translateY(-2px);
    }
  }
  
  &--clickable {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
  
  &--shadow {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
  }
  
  &__header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-light);
  }

  
  &__footer {
    padding: 16px 20px;
    border-top: 1px solid var(--border-color);
    background: var(--bg-light);
  }
}

// Responsive
@media (max-width: 768px) {
  .card {
    &--padding-lg {
      .card__content {
        padding: 16px;
      }
    }
  }
}
</style> 