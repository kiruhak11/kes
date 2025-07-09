<template>
  <!-- Категории -->
  <div>
    <h1>Управление категориями</h1>
    <div class="category-manager">
      <div class="category-actions">
        <button class="btn btn-primary" @click="showAddCategoryModal = true">
          <i class="fas fa-plus"></i> Добавить категорию
        </button>
        <button
          class="btn btn-warning"
          @click="confirmDeleteEmptyCategories"
          :disabled="isDeleting"
        >
          <i class="fas fa-trash-alt"></i>
          {{ isDeleting ? "Удаление..." : "Удалить все пустые категории" }}
        </button>
      </div>
      <div class="categories-grid">
        <div v-for="cat in categories" :key="cat.id" class="category-card">
          <div class="category-card__header">
            <h3>{{ cat.name }}</h3>
            <div class="category-card__actions">
              <button @click="editCategory(cat)">
                <UiEdit />
              </button>
              <button
                @click="
                  cat.id
                    ? deleteCategory(cat.id)
                    : modalStore.showError('ID категории не указан')
                "
              >
                <UiDelete />
              </button>
            </div>
          </div>
          <div class="category-card__content">
            <div class="category-info">
              <p><strong>Slug:</strong> {{ cat.slug }}</p>
              <p><strong>Описание:</strong></p>
              <p class="category-description">
                {{ cat.description || "Нет описания" }}
              </p>
            </div>
            <div class="category-stats">
              <p>
                <strong>Товаров в категории:</strong>
                {{ getCategoryProductCount(cat.id) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления категории -->
    <div
      v-if="showAddCategoryModal"
      class="modal-overlay"
      @click="showAddCategoryModal = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Добавить категорию</h2>
          <button class="close-button" @click="showAddCategoryModal = false">
            &times;
          </button>
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
              <label>Slug:</label>
              <input
                v-model="newCategoryLocal.slug"
                placeholder="Генерируется автоматически"
                class="form-control"
                readonly
              />
              <small class="form-text text-muted">
                Генерируется автоматически из названия категории
              </small>
            </div>
            <div class="modal-actions">
              <button
                type="button"
                class="btn btn-secondary"
                @click="showAddCategoryModal = false"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="!newCategoryLocal.name || !newCategoryLocal.slug"
              >
                Добавить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования категории -->
    <div
      v-if="showEditCategoryModal"
      class="modal-overlay"
      @click="closeEditCategoryModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Редактировать категорию</h2>
          <button class="close-button" @click="closeEditCategoryModal">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <form
            v-if="editingCategoryLocal"
            @submit.prevent="saveCategory"
            class="category-form"
          >
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
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeEditCategoryModal"
              >
                Отмена
              </button>
              <button type="submit" class="btn btn-primary">Сохранить</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { PropType } from "vue";
import { useModalStore } from "../stores/modal";

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Product {
  id: number;
  category: string;
  category_id?: string;
  category_slug?: string;
}

const props = defineProps({
  categories: {
    type: Array as PropType<AdminCategory[]>,
    required: true,
  },
  products: {
    type: Array as PropType<Product[]>,
    required: true,
  },
  newCategory: {
    type: Object as PropType<Record<string, any>>,
    required: true,
  },
  editingCategory: {
    type: Object as PropType<Record<string, any> | null>,
    required: true,
  },
  showAddCategoryModal: Boolean,
  showEditCategoryModal: Boolean,
  getCategoryProductCount: {
    type: Function as PropType<(id: string) => number>,
    required: true,
  },
  isDeleting: Boolean,
});

const emit = defineEmits<{
  (e: "add-category"): void;
  (e: "edit-category", category: AdminCategory): void;
  (e: "save-category"): void;
  (e: "delete-category", id: string): void;
  (e: "delete-empty-categories"): void;
  (e: "close-edit-category-modal"): void;
  (e: "update:newCategory", val: any): void;
  (e: "update:editingCategory", val: any): void;
  (e: "update:showAddCategoryModal", val: boolean): void;
  (e: "update:showEditCategoryModal", val: boolean): void;
  (e: "update:isDeleting", val: boolean): void;
}>();

// Локальные переменные для управления состоянием
const showAddCategoryModal = ref(props.showAddCategoryModal || false);
const showEditCategoryModal = ref(props.showEditCategoryModal || false);

const newCategoryLocal = ref(props.newCategory);
const editingCategoryLocal = ref(props.editingCategory);

// Watchers для синхронизации с пропсами
watch(
  () => props.showAddCategoryModal,
  (val) => {
    showAddCategoryModal.value = val || false;
  }
);
watch(
  () => props.showEditCategoryModal,
  (val) => {
    showEditCategoryModal.value = val || false;
  }
);
watch(
  () => props.newCategory,
  (val) => {
    newCategoryLocal.value = val;
  }
);
watch(
  () => props.editingCategory,
  (val) => {
    editingCategoryLocal.value = val;
  }
);

// Автоматическая генерация slug при изменении названия
watch(
  () => newCategoryLocal.value.name,
  (newName) => {
    if (newName) {
      newCategoryLocal.value.slug = generateSlug(newName);
    }
  }
);

// Watchers для emit событий
watch(showAddCategoryModal, (val) => {
  emit("update:showAddCategoryModal", val);
});
watch(showEditCategoryModal, (val) => {
  emit("update:showEditCategoryModal", val);
});
watch(newCategoryLocal, (val) => {
  emit("update:newCategory", val);
});
watch(editingCategoryLocal, (val) => {
  emit("update:editingCategory", val);
});
watch(
  () => props.isDeleting,
  (val) => {
    emit("update:isDeleting", val);
  }
);

// Методы
const addCategory = () => {
  if (!newCategoryLocal.value.name || !newCategoryLocal.value.slug) {
    return;
  }
  emit("add-category");
  // Очищаем форму после добавления
  newCategoryLocal.value = {
    name: "",
    description: "",
    slug: "",
  };
  showAddCategoryModal.value = false;
};

const editCategory = (category: AdminCategory) => {
  editingCategoryLocal.value = { ...category };
  showEditCategoryModal.value = true;
};

const saveCategory = () => {
  emit("save-category");
};

const modalStore = useModalStore();

// Функции для работы с категориями
const confirmDeleteEmptyCategories = async () => {
  modalStore.showConfirm(
    "Вы уверены, что хотите удалить все пустые категории? Это действие нельзя отменить.",
    async () => {
      try {
        emit("update:isDeleting", true);

        const response = await fetch("/api/categories/delete-empty", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.statusMessage || "Failed to delete empty categories"
          );
        }

        // Обновляем список категорий через emit
        emit("delete-empty-categories");
      } catch (error: any) {
        console.error("Error deleting empty categories:", error);
        modalStore.showError(
          `Ошибка при удалении пустых категорий: ${
            error.message || "Неизвестная ошибка"
          }`
        );
      } finally {
        emit("update:isDeleting", false);
      }
    }
  );
};

const deleteCategory = (id: string) => {
  if (!id) {
    modalStore.showError("ID категории не указан");
    return;
  }

  // Просто эмитим событие, API-запрос будет в родительском компоненте
  emit("delete-category", id);
};

const closeEditCategoryModal = () => {
  showEditCategoryModal.value = false;
  emit("close-edit-category-modal");
};

const transliterate = (text: string): string => {
  const mapping: { [key: string]: string } = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
    А: "A",
    Б: "B",
    В: "V",
    Г: "G",
    Д: "D",
    Е: "E",
    Ё: "Yo",
    Ж: "Zh",
    З: "Z",
    И: "I",
    Й: "Y",
    К: "K",
    Л: "L",
    М: "M",
    Н: "N",
    О: "O",
    П: "P",
    Р: "R",
    С: "S",
    Т: "T",
    У: "U",
    Ф: "F",
    Х: "Kh",
    Ц: "Ts",
    Ч: "Ch",
    Ш: "Sh",
    Щ: "Sch",
    Ъ: "",
    Ы: "Y",
    Ь: "",
    Э: "E",
    Ю: "Yu",
    Я: "Ya",
  };
  return text
    .split("")
    .map((char) => mapping[char] || char)
    .join("");
};

const generateSlug = (name: string): string => {
  return transliterate(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
</script>

<style scoped>
.category-manager {
  padding: 2rem;
  background: var(--bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
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
