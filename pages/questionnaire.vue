<template>
  <div class="files-container">
    <h1>Доступные файлы</h1>
    <div v-if="files.length === 0" class="no-files">
      Нет доступных файлов
    </div>
    <div v-else class="files-list">
      <div v-for="file in files" :key="file.name" class="file-item">
        <span class="file-name">{{ file.name }}</span>
        <button 
          @click="downloadFile(file)"
          class="download-button"
        >
          Скачать
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      files: []
    }
  },
  methods: {
    async fetchFiles() {
      try {
        // Здесь будет логика получения списка файлов
        // Пока используем заглушку
        this.files = [
          { name: 'Пример файла 1' },
          { name: 'Пример файла 2' }
        ]
      } catch (error) {
        console.error('Ошибка при получении списка файлов:', error)
      }
    },
    downloadFile(file) {
      // Здесь будет логика скачивания файла 
    }
  },
  mounted() {
    this.fetchFiles()
  }
}
</script>

<style scoped>
.files-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.no-files {
  text-align: center;
  color: #666;
  padding: 20px;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.file-item:hover {
  background-color: #e9e9e9;
}

.file-name {
  font-size: 16px;
}

.download-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.download-button:hover {
  background-color: #45a049;
}
</style>
