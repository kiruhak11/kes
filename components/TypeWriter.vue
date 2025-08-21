<template>
  <span class="typewriter">
    <span class="dynamic-text">{{ currentText }}</span>
    <span class="cursor">|</span>
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

// Получаем фразы как пропсы
const props = defineProps<{
  phrases?: string[];
  staticText?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  startDelay?: number;
}>();

// Используем переданные фразы или дефолтные
const words = props.phrases || ["котельной", "котла"];
const currentText = ref("");
const currentWordIndex = ref(0);
const isDeleting = ref(false);
const typingSpeed = props.typingSpeed || 100;
const deletingSpeed = props.deletingSpeed || 50;
const pauseTime = props.pauseTime || 2500;
const startDelay = props.startDelay || 800;

let timeout: number | undefined;

const type = () => {
  const currentWord = words[currentWordIndex.value];

  if (isDeleting.value) {
    currentText.value = currentWord.substring(0, currentText.value.length - 1);
  } else {
    currentText.value = currentWord.substring(0, currentText.value.length + 1);
  }

  let typeSpeed = isDeleting.value ? deletingSpeed : typingSpeed;

  if (!isDeleting.value && currentText.value === currentWord) {
    typeSpeed = pauseTime;
    isDeleting.value = true;
  } else if (isDeleting.value && currentText.value === "") {
    isDeleting.value = false;
    currentWordIndex.value = (currentWordIndex.value + 1) % words.length;
    typeSpeed = startDelay;
  }

  timeout = window.setTimeout(type, typeSpeed);
};

onMounted(() => {
  type();
});

onBeforeUnmount(() => {
  if (timeout) clearTimeout(timeout);
});
</script>

<style lang="scss" scoped>
.typewriter {
  display: inline-block;
}

.static-text {
  margin-right: 4px;
}

.dynamic-text {
  color: #e31e23;
  font-weight: 600;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 2px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
