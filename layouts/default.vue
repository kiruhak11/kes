<template>
  <div class="app">
    <Header />
    <div class="content"><slot></slot></div>
    <button
      :class="['button-go-top', { 'button-go-top_active': isActive }]"
      @click="goTop"
    >
      <IconsGoTop />
    </button>
    <Footer />
  </div>
</template>

<script setup lang="ts">
const goTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
const isActive = ref<boolean>(false);
const scrollListener = () => {
  if (window.scrollY >= 400) {
    isActive.value = true;
    return;
  }
  isActive.value = false;
};
onMounted(() => {
  window.addEventListener("scroll", scrollListener);
});
onUnmounted(() => {
  window.removeEventListener("scroll", scrollListener);
});
</script>

<style scoped lang="scss">
.content {
  flex-grow: 1;
}
body {
  background-color: var(--background-color);
}
.app {
  display: flex;
  position: relative;
  flex-direction: column;
  min-height: 100dvh;
}
.button-go-top {
  background-color: var(--background-color);
  color: var(--color-text);
  padding: 12px;
  border-radius: 100%;
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 2;
  opacity: 0;
  cursor: pointer;
  visibility: hidden;
  border: 1px solid var(--color-text);
  transition: all 0.3s cubic-bezier(0.27, 0.09, 0.42, 1.53);

  &_active {
    opacity: 1;
    visibility: visible;
  }
  &:hover {
    background-color: var(--background-color-hover);
    color: var(--color-text-hover);
    border: 1px solid var(--color-text);
  }

  svg {
    width: 18px;
    height: 18px;
  }
}
</style>