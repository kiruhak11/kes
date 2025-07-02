import { ref } from 'vue'

export interface UseFileStorageOptions {
  clearOldFiles?: boolean
}

export function useFileStorage(options: UseFileStorageOptions = {}) {
  const files = ref<File[]>([])

  const handleFileInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files) return
    const selectedFiles = Array.from(input.files)
    if (options.clearOldFiles) {
      files.value = selectedFiles
    } else {
      files.value.push(...selectedFiles)
    }
  }

  const uploadFiles = async (uploadFiles: File[]): Promise<string[]> => {
    try {
      const uploadPromises = uploadFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('/api/files', {
          method: 'POST',
          body: formData
        })
        const data = await response.json()
        // Возвращаем путь в формате /api/uploads/имя_файла
        return data.path.replace(/^\/uploads\//, '/api/uploads/')
      })
      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error)
      return []
    }
  }

  const uploadSingleFile = async (file: File): Promise<string> => {
    const paths = await uploadFiles([file])
    return paths[0]
  }

  const deleteFile = async (fileName: string): Promise<void> => {
    try {
      const response = await $fetch('/api/files', {
        method: 'DELETE',
        query: { fileName }
      })
      
      if (!response.success) {
        throw new Error('Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  const getFiles = async (): Promise<Array<{name: string, path: string}>> => {
    try {
      const response = await $fetch('/api/files', {
        method: 'GET'
      })
      
      if (!response.success) {
        throw new Error('Failed to get files')
      }
      
      return response.files.map(file => ({
        name: file.name || 'unknown',
        path: file.path
      }))
    } catch (error) {
      console.error('Error getting files:', error)
      throw error
    }
  }

  // Вспомогательная функция для конвертации File в data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return {
    files,
    handleFileInput,
    uploadFiles,
    uploadSingleFile,
    deleteFile,
    getFiles
  }
} 