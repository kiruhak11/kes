<template>
  <div class="app">
    <div class="app-bg"></div>
    <Header />
    <div class="content"><slot></slot></div>
    <UiGoTop
      :class="['button-go-top', { 'button-go-top_active': isActive }]"
      @click="goTop"
    >
    </UiGoTop>
    <Footer />
  </div>
</template>
<script setup lang="ts">
let scrollTicking = false;

const updateGoTopState = () => {
  isActive.value = window.scrollY >= 400;
};

const scrollListener = () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    updateGoTopState();
    scrollTicking = false;
  });
};

onMounted(() => {
  updateGoTopState();
  window.addEventListener("scroll", scrollListener, { passive: true });
});

const goTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const isActive = ref<boolean>(false);

onUnmounted(() => {
  window.removeEventListener("scroll", scrollListener);
});
</script>

<style scoped lang="scss">
.content {
  flex-grow: 1;
}
.app {
  display: flex;
  position: relative;
  flex-direction: column;
  min-height: 100dvh;
}
.button-go-top {
  padding: 12px;
  border-radius: 100%;
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 2;
  opacity: 0;
  cursor: pointer;
  visibility: hidden;
  transition: opacity 0.3s cubic-bezier(0.27, 0.09, 0.42, 1.53),
    visibility 0.3s cubic-bezier(0.27, 0.09, 0.42, 1.53),
    transform 0.3s cubic-bezier(0.27, 0.09, 0.42, 1.53);

  &_active {
    opacity: 1;
    visibility: visible;
  }

  svg {
    width: 18px;
    height: 18px;
  }
}
.app-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(120deg, #fff 0%, #f5f5f5 100%);
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: url("/images/hero4.png") center/cover no-repeat;
    opacity: 0.08;
    filter: blur(2px);
    pointer-events: none;
    z-index: -1;
  }
}
</style>
