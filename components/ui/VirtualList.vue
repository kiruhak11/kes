<template>
  <div
    ref="containerRef"
    class="virtual-list"
    :style="{ height: `${height}px` }"
    @scroll="handleScroll"
  >
    <div
      class="virtual-list__content"
      :style="{ height: `${totalHeight}px`, transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.index"
        class="virtual-list__item"
        :style="{ height: `${itemHeight}px` }"
      >
        <slot :item="item.data" :index="item.index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface Props {
  items: any[]
  itemHeight: number
  height: number
  overscan?: number
}

const props = withDefaults(defineProps<Props>(), {
  overscan: 5,
})

const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)

const totalHeight = computed(() => props.items.length * props.itemHeight)

const startIndex = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  return Math.max(0, start - props.overscan)
})

const endIndex = computed(() => {
  const end = Math.floor((scrollTop.value + props.height) / props.itemHeight)
  return Math.min(props.items.length - 1, end + props.overscan)
})

const visibleItems = computed(() => {
  const items = []
  for (let i = startIndex.value; i <= endIndex.value; i++) {
    items.push({
      data: props.items[i],
      index: i,
    })
  }
  return items
})

const offsetY = computed(() => startIndex.value * props.itemHeight)

const handleScroll = () => {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
  }
}

// Оптимизация производительности
let scrollTimeout: NodeJS.Timeout | null = null

const throttledScroll = () => {
  if (scrollTimeout) return
  
  scrollTimeout = setTimeout(() => {
    handleScroll()
    scrollTimeout = null
  }, 16) // ~60fps
}

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', throttledScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', throttledScroll)
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})
</script>

<style lang="scss" scoped>
.virtual-list {
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  
  &__content {
    position: relative;
  }
  
  &__item {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
}
</style> 