import type { Characteristic } from '~/types/product'

/**
 * Конвертирует старый формат характеристик (объект) в новый (массив)
 */
export function convertSpecsToCharacteristics(specs: Record<string, any> | null): Characteristic[] {
  console.log('convertSpecsToCharacteristics input:', specs)
  
  if (!specs || typeof specs !== 'object') {
    console.log('convertSpecsToCharacteristics: invalid input, returning empty array')
    return []
  }

  // Проверяем, если specs уже в новом формате (массив объектов с id, key, value)
  if (Array.isArray(specs)) {
    console.log('convertSpecsToCharacteristics: specs is already an array, validating format')
    const isValidArray = specs.every(item => 
      typeof item === 'object' && 
      item !== null && 
      'id' in item && 
      'key' in item && 
      'value' in item
    )
    
    if (isValidArray) {
      console.log('convertSpecsToCharacteristics: specs is already in correct format, returning as is')
      return specs as Characteristic[]
    } else {
      console.log('convertSpecsToCharacteristics: specs is array but not in correct format, treating as old format')
    }
  }

  // Если это объект (старый формат), конвертируем в массив
  if (!Array.isArray(specs)) {
    const result = Object.entries(specs)
      .filter(([key, value]) => {
        // Исключаем служебные поля
        if (['images', 'power', 'fuel', 'powerUnit'].includes(key)) {
          return false
        }
        // Исключаем пустые значения
        return value !== null && value !== undefined && value !== ''
      })
      .map(([key, value], index) => ({
        id: index + 1,
        key,
        value: Array.isArray(value) ? value.join(', ') : String(value)
      }))
      
    console.log('convertSpecsToCharacteristics output (converted from object):', result)
    return result
  }

  // Если это массив, но не в правильном формате, возвращаем пустой массив
  console.log('convertSpecsToCharacteristics: invalid array format, returning empty array')
  return []
}

/**
 * Конвертирует новый формат характеристик (массив) в старый (объект) для обратной совместимости
 */
export function convertCharacteristicsToSpecs(characteristics: Characteristic[] | null): Record<string, any> {
  if (!characteristics || !Array.isArray(characteristics)) {
    return {}
  }

  const specs: Record<string, any> = {}
  characteristics.forEach(char => {
    if (char.key && char.value) {
      specs[char.key] = char.value
    }
  })
  return specs
}

/**
 * Создает новый объект характеристик с уникальным ID
 */
export function createCharacteristic(key: string, value: string, existingCharacteristics: Characteristic[] = []): Characteristic {
  const maxId = existingCharacteristics.length > 0 
    ? Math.max(...existingCharacteristics.map(c => c.id))
    : 0
  
  return {
    id: maxId + 1,
    key,
    value
  }
}

/**
 * Обновляет характеристику по ID
 */
export function updateCharacteristic(
  characteristics: Characteristic[],
  id: number,
  updates: Partial<Omit<Characteristic, 'id'>>
): Characteristic[] {
  return characteristics.map(char => 
    char.id === id ? { ...char, ...updates } : char
  )
}

/**
 * Удаляет характеристику по ID
 */
export function removeCharacteristic(characteristics: Characteristic[], id: number): Characteristic[] {
  return characteristics.filter(char => char.id !== id)
}

/**
 * Добавляет новую характеристику в конец списка
 */
export function addCharacteristic(
  characteristics: Characteristic[],
  key: string,
  value: string
): Characteristic[] {
  const newChar = createCharacteristic(key, value, characteristics)
  return [...characteristics, newChar]
}

/**
 * Сортирует характеристики по ID
 */
export function sortCharacteristics(characteristics: Characteristic[]): Characteristic[] {
  return [...characteristics].sort((a, b) => a.id - b.id)
}

/**
 * Фильтрует характеристики по ключу
 */
export function filterCharacteristicsByKey(
  characteristics: Characteristic[],
  key: string
): Characteristic[] {
  return characteristics.filter(char => 
    char.key.toLowerCase().includes(key.toLowerCase())
  )
}

/**
 * Фильтрует характеристики по значению
 */
export function filterCharacteristicsByValue(
  characteristics: Characteristic[],
  value: string
): Characteristic[] {
  return characteristics.filter(char => 
    char.value.toLowerCase().includes(value.toLowerCase())
  )
}

/**
 * Получает уникальные ключи из списка характеристик
 */
export function getUniqueKeys(characteristics: Characteristic[]): string[] {
  const keys = new Set<string>()
  characteristics.forEach(char => {
    if (char.key) {
      keys.add(char.key)
    }
  })
  return Array.from(keys).sort()
}

/**
 * Получает уникальные значения для конкретного ключа
 */
export function getUniqueValuesForKey(
  characteristics: Characteristic[],
  key: string
): string[] {
  const values = new Set<string>()
  characteristics.forEach(char => {
    if (char.key === key && char.value) {
      values.add(char.value)
    }
  })
  return Array.from(values).sort()
} 