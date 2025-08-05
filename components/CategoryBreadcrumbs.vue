<template>
  <nav class="breadcrumbs" v-scroll-reveal="'fade-in'">
    <NuxtLink to="/">Главная</NuxtLink>
    <span class="breadcrumbs-separator">→</span>
    <NuxtLink to="/catalog">Каталог</NuxtLink>
    <span class="breadcrumbs-separator">→</span>
    <span>{{ title }}</span>
  </nav>
</template>
<script setup lang="ts">
defineProps<{ title: string }>();
</script>
