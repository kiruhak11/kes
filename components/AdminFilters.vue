<template>
  <div class="admin-filters">
    <div class="filters-header">
      <h1>Управление фильтрами</h1>
      <p class="filters-description">
        Выберите категорию и управляйте фильтрами только для неё
      </p>
    </div>

    <!-- Tabs для категорий -->
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.id"
        :class="{ active: selectedCategoryId === cat.id }"
        @click="selectedCategoryId = cat.id"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Панель управления -->
    <div class="filters-controls">
      <div class="filters-actions">
        <button 
          class="btn btn-primary" 
          @click="saveAllFilters"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
        </button>
        <button 
          class="btn btn-secondary" 
          @click="selectAllFilters"
        >
          Выбрать все
        </button>
        <button 
          class="btn btn-secondary" 
          @click="deselectAllFilters"
        >
          Снять все
        </button>
      </div>
      
      <div class="filters-search">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Поиск характеристик..." 
          class="form-control"
        />
      </div>
    </div>

    <!-- Список характеристик -->
    <div class="filters-list">
      <div class="filters-categories">
        <div 
          v-for="category in filteredCategories"
          :key="category.name"
          v-show="category.id === selectedCategoryId"
          class="filter-category"
        >
          <div class="filter-category-header">
            <h3 class="filter-category-title">{{ category.name }}</h3>
            <div class="filter-category-actions">
              <button 
                class="btn btn-sm btn-secondary"
                @click="toggleCategory(category.name)"
              >
                {{ getCategorySelectedCount(category.name) }}/{{ category.specs.length }}
              </button>
            </div>
          </div>
          
          <div class="filter-specs-grid">
            <div 
              v-for="spec in category.specs" 
              :key="`${category.name}-${spec.key}`"
              class="filter-spec-item"
              :class="{ 'filter-spec-item--selected': spec.show_in_filters }"
            >
              <div class="filter-spec-content">
                <div class="filter-spec-info">
                  <h4 class="filter-spec-key">{{ spec.key }}</h4>
                  <p class="filter-spec-value">{{ spec.value }}</p>
                  <span class="filter-spec-count">{{ spec.count }} товаров</span>
                </div>
                
                <div class="filter-spec-controls">
                  <label class="filter-checkbox">
                    <input 
                      type="checkbox" 
                      :checked="spec.show_in_filters"
                      @change="toggleSpecFilter(category.name, spec.key, ($event.target as HTMLInputElement).checked)"
                    />
                    <span class="filter-checkbox-custom"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Статистика -->
    <div class="filters-stats">
      <div class="stats-card">
        <h4>Статистика</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Всего характеристик:</span>
            <span class="stat-value">{{ totalSpecs }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">В фильтрах:</span>
            <span class="stat-value">{{ selectedSpecs }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Категорий товаров:</span>
            <span class="stat-value">{{ categories.length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Spec {
  key: string
  value: string
  show_in_filters: boolean
  count: number
}

interface Category {
  id: string
  name: string
  specs: Spec[]
}

interface Props {
  products: any[]
  specsList: Record<number, any[]>
  categories: any[]
}

const props = defineProps<Props>()

const isSaving = ref(false)
const searchQuery = ref('')
const selectedCategoryId = ref(props.categories[0]?.id || '')

// Получаем все уникальные характеристики из товаров по категориям
const groupedSpecs = computed(() => {
  const categoriesMap = new Map<string, { id: string, name: string, specs: Spec[] }>()
  props.categories.forEach(cat => {
    categoriesMap.set(cat.id, { id: cat.id, name: cat.name, specs: [] })
  })
  Object.values(props.specsList).forEach(specs => {
    specs.forEach(spec => {
      // Найти категорию для этого товара
      const product = props.products.find(p => Array.isArray(p.specs) && p.specs.some((s: { key: any; value: any }) => s.key === spec.key && s.value === spec.value))
      if (product && product.category_id && categoriesMap.has(product.category_id)) {
        const cat = categoriesMap.get(product.category_id)!
        // Проверяем, есть ли уже такая характеристика
        let existing = cat.specs.find(s => s.key === spec.key)
        if (!existing) {
          cat.specs.push({ ...spec, count: 1 })
        } else {
          existing.count++
          if (spec.show_in_filters) existing.show_in_filters = true
        }
      }
    })
  })
  return Array.from(categoriesMap.values())
})

// Фильтруем по поиску
const filteredCategories = computed(() => {
  if (!searchQuery.value) return groupedSpecs.value
  return groupedSpecs.value.map(category => ({
    ...category,
    specs: category.specs.filter(spec => 
      spec.key.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      spec.value.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })).filter(category => category.specs.length > 0)
})

// Статистика
const totalSpecs = computed(() => {
  const cat = groupedSpecs.value.find(c => c.id === selectedCategoryId.value)
  return cat ? cat.specs.length : 0
})
const selectedSpecs = computed(() => {
  const cat = groupedSpecs.value.find(c => c.id === selectedCategoryId.value)
  return cat ? cat.specs.filter(spec => spec.show_in_filters).length : 0
})

// Методы
const toggleSpecFilter = (categoryName: string, specKey: string, value: boolean) => {
  // Обновляем только в выбранной категории
  const cat = groupedSpecs.value.find(c => c.name === categoryName)
  if (!cat) return
  const spec = cat.specs.find(s => s.key === specKey)
  if (spec) spec.show_in_filters = value
  // Обновляем во всех товарах этой категории
  Object.values(props.specsList).forEach(specs => {
    const product = props.products.find(p => p.category_id === cat.id)
    if (product) {
      specs.forEach(s => {
        if (s.key === specKey) s.show_in_filters = value
      })
    }
  })
}

const toggleCategory = (categoryName: string) => {
  const cat = groupedSpecs.value.find(c => c.name === categoryName)
  if (!cat) return
  const allSelected = cat.specs.every(spec => spec.show_in_filters)
  const newValue = !allSelected
  cat.specs.forEach(spec => {
    toggleSpecFilter(categoryName, spec.key, newValue)
  })
}

const getCategorySelectedCount = (categoryName: string) => {
  const cat = groupedSpecs.value.find(c => c.name === categoryName)
  if (!cat) return 0
  return cat.specs.filter(spec => spec.show_in_filters).length
}

const selectAllFilters = () => {
  const cat = groupedSpecs.value.find(c => c.id === selectedCategoryId.value)
  if (!cat) return
  cat.specs.forEach(spec => {
    toggleSpecFilter(cat.name, spec.key, true)
  })
}

const deselectAllFilters = () => {
  const cat = groupedSpecs.value.find(c => c.id === selectedCategoryId.value)
  if (!cat) return
  cat.specs.forEach(spec => {
    toggleSpecFilter(cat.name, spec.key, false)
  })
}

const saveAllFilters = async () => {
  isSaving.value = true
  try {
    // Сохраняем изменения только для выбранной категории
    const cat = groupedSpecs.value.find(c => c.id === selectedCategoryId.value)
    if (!cat) return
    const updatePromises = props.products
      .filter(p => p.category_id === cat.id)
      .map(async (product) => {
        const specs = props.specsList[product.id]
        if (!specs) return
        const category = props.categories?.find(c => c.id === product.category_id)
        if (!category) return
        const updateData = {
          name: product.name,
          description: product.description,
          extendedDescription: product.extendedDescription || '',
          price: Number(product.price),
          image: product.image,
          category_id: category.id,
          specs: specs,
          additional_images: product.additional_images || [],
          delivery_set: product.delivery_set || null,
          connection_scheme: product.connection_scheme || null,
          additional_requirements: product.additional_requirements || null,
          required_products: product.required_products || []
        }
        await $fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          body: updateData
        })
      })
    await Promise.all(updatePromises)
    if (typeof window !== 'undefined') {
      alert('Изменения сохранены!')
    }
  } catch (error) {
    console.error('Error saving filters:', error)
    if (typeof window !== 'undefined') {
      alert('Ошибка при сохранении изменений')
    }
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  // nothing
})
</script>

<style scoped>
.admin-filters {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.filters-header {
  text-align: center;
  margin-bottom: 2rem;
}

.filters-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.filters-description {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.filters-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.filters-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filters-search {
  flex: 1;
  max-width: 300px;
}

.filters-search input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.filters-list {
  margin-bottom: 2rem;
}

.filters-categories {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.filter-category {
  background: var(--bg-light);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--border);
}

.filter-category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.filter-category-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.filter-specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.filter-spec-item {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.2s ease;
}

.filter-spec-item:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-spec-item--selected {
  border-color: var(--primary);
  background: rgba(var(--primary-rgb), 0.05);
}

.filter-spec-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.filter-spec-info {
  flex: 1;
}

.filter-spec-key {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.filter-spec-value {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
}

.filter-spec-count {
  font-size: 0.8rem;
  color: var(--text-muted);
  background: var(--bg-light);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.filter-spec-controls {
  flex-shrink: 0;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.filter-checkbox input {
  display: none;
}

.filter-checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  position: relative;
  transition: all 0.2s ease;
}

.filter-checkbox input:checked + .filter-checkbox-custom {
  background: var(--primary);
  border-color: var(--primary);
}

.filter-checkbox input:checked + .filter-checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.filters-stats {
  margin-top: 2rem;
}

.stats-card {
  background: var(--bg-light);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--border);
}

.stats-card h4 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 0.5rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-primary:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-light);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.category-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}
.category-tabs button {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 0.5rem 0.5rem 0 0;
  background: var(--bg-light);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.category-tabs button.active {
  background: var(--primary);
  color: #fff;
}

@media (max-width: 768px) {
  .admin-filters {
    padding: 1rem;
  }
  
  .filters-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-actions {
    justify-content: center;
  }
  
  .filters-search {
    max-width: none;
  }
  
  .filter-specs-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-category-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style> 