<template>
  <div class="test-files-container">
    <h1>Тестирование файлов</h1>
    
    <div class="test-section">
      <h2>1. Проверка файлов в папке uploads</h2>
      <button @click="testFiles" :disabled="loading">Проверить файлы</button>
      <div v-if="filesResult" class="result">
        <h3>Результат:</h3>
        <pre>{{ JSON.stringify(filesResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h2>2. Исправление путей в базе данных</h2>
      <button @click="fixPaths" :disabled="fixingPaths">Исправить пути</button>
      <div v-if="fixResult" class="result">
        <h3>Результат:</h3>
        <pre>{{ JSON.stringify(fixResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h2>3. Тест загрузки файла</h2>
      <input type="file" @change="testUpload" accept="image/*" />
      <div v-if="uploadResult" class="result">
        <h3>Результат загрузки:</h3>
        <pre>{{ JSON.stringify(uploadResult, null, 2) }}</pre>
        <img v-if="uploadResult.path" :src="uploadResult.path" style="max-width: 200px; margin-top: 10px;" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)
const fixingPaths = ref(false)
const filesResult = ref(null)
const fixResult = ref(null)
const uploadResult = ref(null)

const testFiles = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/test-files')
    filesResult.value = response
  } catch (error) {
    console.error('Error testing files:', error)
    filesResult.value = { error: error.message }
  } finally {
    loading.value = false
  }
}

const fixPaths = async () => {
  fixingPaths.value = true
  try {
    const response = await $fetch('/api/fix-image-paths', { method: 'POST' })
    fixResult.value = response
  } catch (error) {
    console.error('Error fixing paths:', error)
    fixResult.value = { error: error.message }
  } finally {
    fixingPaths.value = false
  }
}

const testUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await $fetch('/api/files', {
      method: 'POST',
      body: {
        files: [{
          name: file.name,
          type: file.type,
          size: file.size,
          content: await fileToDataUrl(file)
        }]
      }
    })
    
    uploadResult.value = response.files[0]
  } catch (error) {
    console.error('Error uploading file:', error)
    uploadResult.value = { error: error.message }
  }
}

const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
</script>

<style scoped>
.test-files-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.test-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

button {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

input[type="file"] {
  margin-top: 0.5rem;
}
</style> 