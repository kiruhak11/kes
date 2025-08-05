<template>
  <div class="category-header" v-scroll-reveal="'fade-in-up'">
    <h1 class="page-title">{{ title }}</h1>
    <p class="category-description">{{ description }}</p>
  </div>
</template>
<script setup lang="ts">
defineProps<{ title: string; description: string }>();
</script>
