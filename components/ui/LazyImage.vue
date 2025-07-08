<template>
  <div class="lazy-image" :class="{ 'lazy-image--loaded': isLoaded }">
    <img
      v-if="isVisible"
      ref="imageRef"
      :src="src"
      :alt="alt"
      :class="imageClass"
      @load="handleLoad"
      @error="handleError"
      loading="lazy"
    />
    <div v-else class="lazy-image__placeholder" :style="placeholderStyle">
      <div class="lazy-image__skeleton"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLazyLoad } from '~/composables/useLazyLoad'

interface Props {
  src: string
  alt: string
  width?: number
  height?: number
  imageClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 0,
  height: 0,
  imageClass: '',
})

const { isVisible, elementRef } = useLazyLoad()
const imageRef = ref<HTMLImageElement | null>(null)
const isLoaded = ref(false)
const isError = ref(false)

const placeholderStyle = computed(() => ({
  width: props.width ? `${props.width}px` : '100%',
  height: props.height ? `${props.height}px` : 'auto',
}))

const handleLoad = () => {
  isLoaded.value = true
}

const handleError = () => {
  isError.value = true
}
</script>

<style lang="scss" scoped>
.lazy-image {
  position: relative;
  overflow: hidden;
  
  &__placeholder {
    background: var(--bg-light);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &__skeleton {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  img {
    width: 100%;
    height: auto;
    transition: opacity 0.3s ease;
    
    &:not(.lazy-image--loaded) {
      opacity: 0;
    }
  }
  
  &--loaded {
    img {
      opacity: 1;
    }
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style> 