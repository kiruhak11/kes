<template>
  <!-- Категории -->
  <div>
    <h1>Управление категориями</h1>
    <div class="category-manager">
      <div class="category-actions">
        <button class="btn btn-primary" @click="showAddCategoryModal = true">
          <i class="fas fa-plus"></i> Добавить категорию
        </button>
        <button class="btn btn-warning" @click="deleteEmptyCategories" :disabled="isDeleting">
          <i class="fas fa-trash-alt"></i> 
          {{ isDeleting ? 'Удаление...' : 'Удалить все пустые категории' }}
        </button>
      </div>
      <div class="categories-grid">
        <div v-for="cat in categories" :key="cat.id" class="category-card">
          <div class="category-card__header">
            <h3>{{ cat.name }}</h3>
            <div class="category-card__actions">
              <button class="btn btn-secondary btn-sm" @click="editCategory(cat)">
                <i class="fas fa-edit"></i> Редактировать
              </button>
              <button class="btn btn-danger btn-sm" @click="deleteCategory(cat.id)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="category-card__content">
            <div class="category-info">
              <p><strong>Slug:</strong> {{ cat.slug }}</p>
              <p><strong>Описание:</strong></p>
              <p class="category-description">{{ cat.description || 'Нет описания' }}</p>
            </div>
            <div class="category-stats">
              <p><strong>Товаров в категории:</strong> {{ getCategoryProductCount(cat.id) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно добавления категории -->
    <div v-if="showAddCategoryModal" class="modal-overlay" @click="showAddCategoryModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Добавить категорию</h2>
          <button class="close-button" @click="showAddCategoryModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addCategory" class="category-form">
            <div class="form-group">
              <label>Название категории:</label>
              <input 
                v-model="newCategoryLocal.name" 
                placeholder="Введите название" 
                required
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Описание:</label>
              <textarea 
                v-model="newCategoryLocal.description" 
                placeholder="Введите описание категории"
                class="form-control"
                rows="4"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Slug (генерируется автоматически):</label>
              <input 
                v-model="newCategoryLocal.slug" 
                placeholder="Генерируется автоматически" 
                disabled
                class="form-control"
              />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="showAddCategoryModal = false">
                Отмена
              </button>
              <button type="submit" class="btn btn-primary">
                Добавить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно редактирования категории -->
    <div v-if="showEditCategoryModal" class="modal-overlay" @click="closeEditCategoryModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Редактировать категорию</h2>
          <button class="close-button" @click="closeEditCategoryModal">&times;</button>
        </div>
        <div class="modal-body">
          <form v-if="editingCategoryLocal" @submit.prevent="saveCategory" class="category-form">
            <div class="form-group">
              <label>Название:</label>
              <input 
                v-model="editingCategoryLocal.name" 
                type="text" 
                class="form-control"
                required
              />
            </div>
            <div class="form-group">
              <label>Описание:</label>
              <textarea 
                v-model="editingCategoryLocal.description" 
                class="form-control"
                rows="4"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Slug:</label>
              <input 
                v-model="editingCategoryLocal.slug" 
                type="text" 
                class="form-control"
                required
              />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeEditCategoryModal">
                Отмена
              </button>
              <button type="submit" class="btn btn-primary">
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'

interface AdminCategory {
  id: string
  name: string
  slug: string
  description?: string
}

interface Product {
  id: number
  category: string
  category_id?: string
  category_slug?: string
}

const props = defineProps({
  categories: {
    type: Array as PropType<AdminCategory[]>,
    required: true
  },
  products: {
    type: Array as PropType<Product[]>,
    required: true
  },
  newCategory: {
    type: Object as PropType<Record<string, any>>,
    required: true
  },
  editingCategory: {
    type: Object as PropType<Record<string, any> | null>,
    required: true
  },
  showAddCategoryModal: Boolean,
  showEditCategoryModal: Boolean,
  getCategoryProductCount: {
    type: Function as PropType<(id: string) => number>,
    required: true
  },
  isDeleting: Boolean
})

const emit = defineEmits<{
  (e: 'add-category'): void
  (e: 'edit-category', category: AdminCategory): void
  (e: 'save-category'): void
  (e: 'delete-category', id: string): void
  (e: 'delete-empty-categories'): void
  (e: 'close-edit-category-modal'): void
  (e: 'update:newCategory', val: any): void
  (e: 'update:editingCategory', val: any): void
  (e: 'update:showAddCategoryModal', val: boolean): void
  (e: 'update:showEditCategoryModal', val: boolean): void
}>()

// Локальные переменные для управления состоянием
const showAddCategoryModal = ref(props.showAddCategoryModal || false)
const showEditCategoryModal = ref(props.showEditCategoryModal || false)

const newCategoryLocal = ref(props.newCategory)
const editingCategoryLocal = ref(props.editingCategory)

// Watchers для синхронизации с пропсами
watch(() => props.showAddCategoryModal, (val) => { showAddCategoryModal.value = val || false })
watch(() => props.showEditCategoryModal, (val) => { showEditCategoryModal.value = val || false })
watch(() => props.newCategory, (val) => { newCategoryLocal.value = val })
watch(() => props.editingCategory, (val) => { editingCategoryLocal.value = val })

// Watchers для emit событий
watch(showAddCategoryModal, (val) => { emit('update:showAddCategoryModal', val) })
watch(showEditCategoryModal, (val) => { emit('update:showEditCategoryModal', val) })
watch(newCategoryLocal, (val) => { emit('update:newCategory', val) })
watch(editingCategoryLocal, (val) => { emit('update:editingCategory', val) })

// Методы
const addCategory = () => {
  emit('add-category')
}

const editCategory = (category: AdminCategory) => {
  editingCategoryLocal.value = { ...category }
  showEditCategoryModal.value = true
}

const saveCategory = () => {
  emit('save-category')
}

const deleteCategory = (id: string) => {
  emit('delete-category', id)
}

const closeEditCategoryModal = () => {
  showEditCategoryModal.value = false
  emit('close-edit-category-modal')
}

const deleteEmptyCategories = () => {
  emit('delete-empty-categories')
}
</script>

<style scoped>
.category-manager {
  padding: 2rem;
  background: var(--bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.category-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.category-actions .btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.category-actions .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
  border: 1px solid #ffc107;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
  border-color: #d39e00;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}
.category-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
.category-card__header {
  padding: 1rem;
  background: var(--primary-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.category-card__header h3 {
  margin: 0;
  color: var(--primary);
  font-size: 1.2rem;
}
.category-card__actions {
  display: flex;
  gap: 0.5rem;
}
.category-card__actions .btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
}
.category-card__content {
  padding: 1rem;
}
.category-info {
  margin-bottom: 1rem;
}
.category-info p {
  margin: 0.5rem 0;
}
.category-description {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-top: 0.5rem;
}
.category-stats {
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  font-size: 0.9rem;
}

/* Стили для модальных окон */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-light);

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text);
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    color: var(--text-light);
    transition: color 0.2s ease;

    &:hover {
      color: var(--text);
    }
  }
}

.modal-body {
  padding: 1.5rem;
}

.category-form {
  .form-group {
    margin-bottom: 1rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 4px;
      font-size: 0.95rem;

      &:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
      }

      &:disabled {
        background: var(--bg-light);
        cursor: not-allowed;
      }
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }
}
</style> 