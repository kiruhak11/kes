import { ref, computed } from 'vue'
import { useDebounce } from './useDebounce'

export const useFormOptimization = () => {
  const { debounce } = useDebounce(300)
  
  const formData = ref<Record<string, any>>({})
  const errors = ref<Record<string, string>>({})
  const isSubmitting = ref(false)
  const isDirty = ref(false)

  // Валидация в реальном времени с debounce
  const validateField = debounce((field: string, value: any, rules: any) => {
    const fieldErrors: string[] = []

    if (rules.required && !value) {
      fieldErrors.push('Это поле обязательно')
    }

    if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      fieldErrors.push('Неверный формат email')
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      fieldErrors.push(`Минимальная длина ${rules.minLength} символов`)
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      fieldErrors.push(`Максимальная длина ${rules.maxLength} символов`)
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      fieldErrors.push(rules.message || 'Неверный формат')
    }

    if (fieldErrors.length > 0) {
      errors.value[field] = fieldErrors[0]
    } else {
      delete errors.value[field]
    }
  })

  // Обновление поля с валидацией
  const updateField = (field: string, value: any, rules?: any) => {
    formData.value[field] = value
    isDirty.value = true

    if (rules) {
      validateField(field, value, rules)
    }
  }

  // Проверка валидности всей формы
  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0
  })

  // Сброс формы
  const resetForm = () => {
    formData.value = {}
    errors.value = {}
    isDirty.value = false
    isSubmitting.value = false
  }

  // Отправка формы с оптимизацией
  const submitForm = async (submitFn: (data: any) => Promise<any>) => {
    if (!isValid.value || isSubmitting.value) {
      return false
    }

    isSubmitting.value = true

    try {
      await submitFn(formData.value)
      resetForm()
      return true
    } catch (error) {
      console.error('Form submission error:', error)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  // Автосохранение формы
  const autoSave = debounce(async (saveFn: (data: any) => Promise<void>) => {
    if (isDirty.value && isValid.value) {
      try {
        await saveFn(formData.value)
        isDirty.value = false
      } catch (error) {
        console.error('Auto-save error:', error)
      }
    }
  })

  return {
    formData: readonly(formData),
    errors: readonly(errors),
    isSubmitting: readonly(isSubmitting),
    isDirty: readonly(isDirty),
    isValid,
    updateField,
    resetForm,
    submitForm,
    autoSave,
  }
} 