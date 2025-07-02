<template>
  <div class="admin-update-page">
    <h1>Обновление характеристик</h1>
    <button @click="updateSpecs" :disabled="isUpdating" class="update-btn">
      {{ isUpdating ? 'Обновление...' : 'Обновить характеристики' }}
    </button>
    <div v-if="result" class="result">
      <h3>Результат:</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const isUpdating = ref(false)
const result = ref<any>(null)

async function updateSpecs() {
  isUpdating.value = true
  try {
    const response = await $fetch('/api/admin/update-specs', {
      method: 'POST'
    })
    result.value = response
  } catch (error: any) {
    console.error('Error updating specs:', error)
    result.value = { error: error.message }
  } finally {
    isUpdating.value = false
  }
}
</script>

<style scoped>
.admin-update-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.update-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.1rem;
}

.update-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style> 