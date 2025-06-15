<template>
  <section class="container">
    <h1>Калькулятор мощности котла</h1>
    <p>Здесь будет калькулятор для подбора мощности котла.</p>
  </section>
</template>

<script setup lang="ts">
// TODO: Загрузка данных из Supabase при необходимости
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}
h1 {
  font-size: 2rem;
  margin-bottom: 20px;
}
p {
  font-size: 1.1rem;
  color: #555;
}
@media (max-width: 768px) {
  .container {
    padding: 20px 8px;
  }
  h1 {
    font-size: 1.2rem;
    margin-bottom: 12px;
  }
  p {
    font-size: 0.98rem;
  }
}
</style> 