<template>
  <div class="test-files-container">
    <h1 v-scroll-reveal="'fade-in-up'">Тестирование файлов</h1>
    
    <div class="test-section" v-scroll-reveal="'fade-in-up'">
      <h2 v-scroll-reveal="'slide-in-left'">1. Проверка файлов в папке uploads</h2>
      <button @click="testFiles" :disabled="loading" v-scroll-reveal="'zoom-in'">Проверить файлы</button>
      <div v-if="filesResult" class="result" v-scroll-reveal="'fade-in-up'">
        <h3>Результат:</h3>
        <pre>{{ JSON.stringify(filesResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section" v-scroll-reveal="'fade-in-up'">
      <h2 v-scroll-reveal="'slide-in-right'">2. Исправление путей в базе данных</h2>
      <button @click="fixPaths" :disabled="fixingPaths" v-scroll-reveal="'zoom-in'">Исправить пути</button>
      <div v-if="fixResult" class="result" v-scroll-reveal="'fade-in-up'">
        <h3>Результат:</h3>
        <pre>{{ JSON.stringify(fixResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section" v-scroll-reveal="'fade-in-up'">
      <h2 v-scroll-reveal="'slide-in-left'">3. Тест загрузки файла</h2>
      <input type="file" @change="testUpload" accept="image/*" v-scroll-reveal="'zoom-in'" />
      <div v-if="uploadResult" class="result" v-scroll-reveal="'fade-in-up'">
        <h3>Результат загрузки:</h3>
        <pre>{{ JSON.stringify(uploadResult, null, 2) }}</pre>
        <div v-if="uploadResult.path" class="image-test" v-scroll-reveal="'slide-in-right'">
          <h4>Тест отображения изображения:</h4>
          <NuxtImg
            :placeholder="true"
            sizes="400px xxs:900px md:1200px"
            format="webp"
            :src="uploadResult.path"
            style="max-width: 200px; margin: 10px 0; border: 1px solid #ccc;"
          />
          <p>Путь: {{ uploadResult.path }}</p>
          <button @click="testImageAccess(uploadResult.path)" v-scroll-reveal="'zoom-in'">Проверить доступ к файлу</button>
          <div v-if="imageTestResult" class="result" v-scroll-reveal="'fade-in-up'">
            <h5>Результат проверки:</h5>
            <pre>{{ JSON.stringify(imageTestResult, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div class="test-section" v-scroll-reveal="'fade-in-up'">
      <h2 v-scroll-reveal="'slide-in-right'">4. Тест существующих файлов</h2>
      <div v-if="filesResult && filesResult.files">
        <div 
          v-for="(file, index) in filesResult.files" 
          :key="file.name" 
          class="file-test"
          v-scroll-reveal="index % 2 === 0 ? 'slide-in-left' : 'slide-in-right'"
        >
          <h4>{{ file.name }}</h4>
          <p>Путь: {{ file.path }}</p>
          <NuxtImg
            :placeholder="true"
            sizes="400px xxs:900px md:1200px"
            format="webp"
            :src="file.path"
            style="max-width: 150px; margin: 5px 0; border: 1px solid #ccc;"
          />
          <button @click="testImageAccess(file.path)" v-scroll-reveal="'zoom-in'">Проверить доступ</button>
        </div>
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
const imageTestResult = ref(null)

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
    imageTestResult.value = null
  } catch (error) {
    console.error('Error uploading file:', error)
    uploadResult.value = { error: error.message }
  }
}

const testImageAccess = async (imagePath) => {
  try {
    // Извлекаем имя файла из пути
    const fileName = imagePath.split('/').pop()
    const testPath = `/api/test-upload/${fileName}`
    
    const response = await fetch(testPath)
    const result = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: testPath
    }
    
    if (response.ok) {
      result.success = 'Файл доступен'
    } else {
      const errorText = await response.text()
      result.error = errorText
    }
    
    imageTestResult.value = result
  } catch (error) {
    imageTestResult.value = {
      error: error.message,
      url: imagePath
    }
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

.file-test {
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
}

.image-test {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
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
  margin: 0.5rem 0.5rem 0.5rem 0;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

input[type="file"] {
  margin-top: 0.5rem;
}
</style> 