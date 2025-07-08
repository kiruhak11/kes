import { ref, watch } from 'vue'

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const stored = ref<T>(defaultValue)

  // Загрузка данных из localStorage
  const loadFromStorage = () => {
    if (process.client) {
      try {
        const item = localStorage.getItem(key)
        if (item !== null) {
          stored.value = JSON.parse(item)
        }
      } catch (error) {
        console.error(`Error loading from localStorage key "${key}":`, error)
      }
    }
  }

  // Сохранение данных в localStorage
  const saveToStorage = (value: T) => {
    if (process.client) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error)
      }
    }
  }

  // Инициализация
  loadFromStorage()

  // Автоматическое сохранение при изменении
  watch(stored, (newValue) => {
    saveToStorage(newValue)
  }, { deep: true })

  // Методы для работы с данными
  const setValue = (value: T) => {
    stored.value = value
  }

  const getValue = (): T => {
    return stored.value
  }

  const removeValue = () => {
    if (process.client) {
      localStorage.removeItem(key)
      stored.value = defaultValue
    }
  }

  const clearAll = () => {
    if (process.client) {
      localStorage.clear()
      stored.value = defaultValue
    }
  }

  return {
    value: stored,
    setValue,
    getValue,
    removeValue,
    clearAll,
  }
}

// Composable для работы с сессией
export const useSessionStorage = <T>(key: string, defaultValue: T) => {
  const stored = ref<T>(defaultValue)

  const loadFromStorage = () => {
    if (process.client) {
      try {
        const item = sessionStorage.getItem(key)
        if (item !== null) {
          stored.value = JSON.parse(item)
        }
      } catch (error) {
        console.error(`Error loading from sessionStorage key "${key}":`, error)
      }
    }
  }

  const saveToStorage = (value: T) => {
    if (process.client) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error(`Error saving to sessionStorage key "${key}":`, error)
      }
    }
  }

  loadFromStorage()

  watch(stored, (newValue) => {
    saveToStorage(newValue)
  }, { deep: true })

  const setValue = (value: T) => {
    stored.value = value
  }

  const getValue = (): T => {
    return stored.value
  }

  const removeValue = () => {
    if (process.client) {
      sessionStorage.removeItem(key)
      stored.value = defaultValue
    }
  }

  return {
    value: stored,
    setValue,
    getValue,
    removeValue,
  }
}