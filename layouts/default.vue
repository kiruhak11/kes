<template>
  <div class="app">
    <div class="app-bg"></div>

    <!-- Yandex.Metrika counter -->
    <div>
      <img
        src="https://mc.yandex.ru/watch/103178484"
        style="position: absolute; left: -9999px"
        alt=""
      />
    </div>
    <!-- /Yandex.Metrika counter -->

    <Header />
    <div class="content"><slot></slot></div>
    <UiGoTop
      :class="['button-go-top', { 'button-go-top_active': isActive }]"
      @click="goTop"
    >
    </UiGoTop>
    <Footer />
    <!-- Временно отключено для проверки стилей -->
    <!-- <SEOSchema type="Organization" /> -->
    <!-- <AdditionalSEOTags pageType="home" /> -->
  </div>
</template>
<script setup lang="ts">
// Временно отключено для проверки стилей
// import SEOSchema from '~/components/SEOSchema.vue';
// import AdditionalSEOTags from '~/components/AdditionalSEOTags.vue';

// TypeScript declarations for Yandex Metrika
declare global {
  interface Window {
    ym: (id: number, action: string, options?: any) => void;
  }
}

// Yandex Metrika initialization
const initYandexMetrika = (retryCount = 0) => {
  const maxRetries = 10; // Maximum 10 retries

  try {
    // Check if ym function is available
    if (typeof window !== "undefined" && window.ym) {
      window.ym(103178484, "init", {
        webvisor: true,
        clickmap: true,
        accurateTrackBounce: true,
        trackLinks: true,
      });
      console.log("Yandex Metrika initialized successfully");
    } else if (retryCount < maxRetries) {
      // Retry after a short delay if ym is not yet available
      setTimeout(() => {
        initYandexMetrika(retryCount + 1);
      }, 500);
    } else {
      console.warn("Yandex Metrika failed to initialize after maximum retries");
    }
  } catch (error) {
    console.warn("Yandex Metrika initialization failed:", error);
  }
};

// Initialize Yandex Metrika when component mounts
onMounted(() => {
  // Initialize Yandex Metrika
  initYandexMetrika();

  window.addEventListener("scroll", scrollListener);
});

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
  transition: all 0.3s cubic-bezier(0.27, 0.09, 0.42, 1.53);

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
