<template>
  <!-- Каталог -->
  <div v-if="adminTab === 'catalog'">
    <!-- Вход в админ-панель -->
    <div v-if="!authorized" class="login-box">
      <h2>Вход в админ-панель</h2>
      <input
        :value="passwordLocal"
        @input="onPasswordInput"
        type="password"
        placeholder="Пароль"
        @keyup.enter="login"
      />
      <div class="remember-me">
        <label class="remember-me__label">
          <input type="checkbox" v-model="rememberMe" />
          <svg viewBox="0 0 64 64" height="1.5em" width="1.5em">
            <path
              d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16"
              pathLength="575.0541381835938"
              class="path"
            ></path>
          </svg>
          <span class="remember-me__text">Запомнить меня</span>
        </label>
      </div>
      <button class="btn btn-primary btn-sm" @click="login">Войти</button>
      <p v-if="loginError" class="error">{{ loginError }}</p>
    </div>

    <!-- Управление каталогом -->
    <div v-else class="catalog-manager">
      <div class="catalog-header">
        <h1>Управление каталогом</h1>

        <UiLogout @click="logout" />
      </div>

      <!-- Форма добавления нового товара -->
      <div class="add-form">
        <!-- Основная информация -->
        <div class="edit-section">
          <h3 class="edit-section__title">Основная информация</h3>
          <div class="edit-section__content">
            <div class="form-row">
              <div class="form-group">
                <label class="required">Категория:</label>
                <div class="category-input">
                  <select
                    v-model="newProdLocal.category"
                    class="form-control"
                    :class="{
                      'required-field':
                        showValidationErrors &&
                        (!newProdLocal.category ||
                          (newProdLocal.category === 'new' &&
                            !newCategoryLocal.name)),
                    }"
                  >
                    <option value="">Выберите категорию</option>
                    <option
                      v-for="cat in categories"
                      :key="cat.id"
                      :value="cat.name"
                    >
                      {{ cat.name }}
                    </option>
                    <option value="new">+ Добавить новую категорию</option>
                  </select>
                  <input
                    v-if="newProdLocal.category === 'new'"
                    v-model="newCategoryLocal.name"
                    placeholder="Название новой категории"
                    class="form-control"
                    :class="{
                      'required-field':
                        showValidationErrors &&
                        newProdLocal.category === 'new' &&
                        !newCategoryLocal.name,
                    }"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="required">Название:</label>
                <input
                  v-model="newProdLocal.name"
                  placeholder="Название товара"
                  class="form-control"
                  :class="{
                    'required-field':
                      showValidationErrors &&
                      (!newProdLocal.name || newProdLocal.name.trim() === ''),
                  }"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="required">Краткое описание:</label>
              <textarea
                v-model="newProdLocal.description"
                placeholder="Краткое описание товара"
                rows="2"
                class="form-control"
                :class="{
                  'required-field':
                    showValidationErrors &&
                    (!newProdLocal.description ||
                      newProdLocal.description.trim() === ''),
                }"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Расширенное описание:</label>
              <MarkdownEditor v-model="newProdLocal.extendedDescription" />
            </div>

            <div class="form-group">
              <label class="required">Цена (₽):</label>
              <input
                v-model.number="newProdLocal.price"
                type="number"
                placeholder="0"
                class="form-control"
                :class="{
                  'required-field':
                    showValidationErrors &&
                    (!newProdLocal.price || newProdLocal.price <= 0),
                }"
              />
            </div>
          </div>
        </div>

        <!-- Изображения -->
        <div class="edit-section">
          <h3 class="edit-section__title">Изображения</h3>
          <div class="edit-section__content">
            <div class="form-group">
              <label>Основное изображение:</label>
              <div class="image-upload">
                <select
                  v-model="newProdLocal.image"
                  class="image-select form-control"
                >
                  <option value="">Выберите изображение</option>
                  <option v-for="img in presetImages" :key="img" :value="img">
                    {{ img.split("/").pop() }}
                  </option>
                  <option value="custom">Загрузить своё изображение</option>
                </select>
                <input
                  v-if="newProdLocal.image === 'custom'"
                  type="file"
                  accept="image/*"
                  @change="(e: any) => handleImageUpload(e, newProdLocal)"
                  class="image-input"
                />
              </div>
              <!-- Новый блок: превью основного изображения как в галерее -->
              <div
                v-if="newProdLocal.image && newProdLocal.image !== 'custom'"
                class="gallery-previews"
                style="margin-top: 0.5rem"
              >
                <div class="gallery-item">
                  <img
                    :src="getImageUrl(newProdLocal.image)"
                    class="img-preview"
                    alt="Основное изображение"
                  />
                  <button
                    class="btn btn-danger btn-sm gallery-remove-btn"
                    @click.prevent="removeMainImage"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Дополнительные изображения:</label>
              <input
                type="file"
                multiple
                accept="image/*"
                @change="handleGalleryUpload"
                class="form-control"
              />
              <div class="gallery-previews">
                <div
                  v-for="(gimg, gidx) in newProdGalleryLocal"
                  :key="gidx"
                  class="gallery-item"
                >
                  <img :src="getImageUrl(gimg)" class="img-preview" />
                  <button
                    class="btn btn-danger btn-sm gallery-remove-btn"
                    @click.prevent="removeGalleryImage(gidx)"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Дополнительная информация -->
        <div class="edit-section">
          <h3 class="edit-section__title">Дополнительная информация</h3>
          <div class="edit-section__content">
            <div class="form-group">
              <label>Комплект поставки:</label>
              <textarea
                v-model="newProdLocal.delivery_set"
                placeholder="Опишите комплект поставки товара"
                rows="3"
                class="form-control"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Дополнительные требования -->
        <div class="edit-section">
          <h3 class="edit-section__title">Дополнительно потребуется</h3>
          <div class="edit-section__content">
            <div class="form-group">
              <label>Описание дополнительных требований:</label>
              <textarea
                v-model="newProdLocal.additional_requirements"
                placeholder="Опишите, что потребуется дополнительно"
                rows="3"
                class="form-control"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Связанные товары:</label>
              <select
                v-model="selectedProduct"
                class="form-control"
                @change="addRequiredProduct"
              >
                <option value="">Выберите товар</option>
                <option
                  v-for="prod in products.filter(
                    (p) => p.id !== newProdLocal.id
                  )"
                  :key="prod.id"
                  :value="prod.id"
                >
                  {{ prod.name }}
                </option>
              </select>

              <div
                v-if="newProdLocal.required_products.length > 0"
                class="required-products-list"
              >
                <div
                  v-for="prodId in newProdLocal.required_products"
                  :key="prodId"
                  class="required-product-item"
                >
                  <span>{{ products.find((p) => p.id === prodId)?.name }}</span>
                  <button class="btn-sm" @click="removeRequiredProduct(prodId)">
                    <UiDeleteSmall />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Характеристики -->
        <div class="edit-section">
          <h3 class="edit-section__title">Характеристики</h3>
          <div class="edit-section__content">
            <!-- Быстрое копирование характеристик -->
            <div class="quick-specs-copy">
              <label>Быстрое копирование характеристик:</label>
              <div class="copy-controls">
                <select
                  v-model="selectedProductForCopy"
                  @change="previewSpecsFromProduct"
                  class="form-control"
                >
                  <option value="">
                    Выберите товар для копирования характеристик
                  </option>
                  <option v-for="p in products" :key="p.id" :value="p.id">
                    {{ p.name }} ({{ p.category_name }})
                  </option>
                </select>
                <button
                  v-if="selectedProductForCopy && previewedSpecs.length > 0"
                  @click="confirmCopySpecs"
                  class="btn btn-primary btn-sm"
                >
                  Подтвердить копирование
                </button>
                <button
                  v-if="selectedProductForCopy"
                  @click="clearCopySelection"
                  class="btn btn-secondary btn-sm"
                >
                  Отмена
                </button>
              </div>

              <!-- Предварительный просмотр характеристик -->
              <div v-if="previewedSpecs.length > 0" class="preview-specs">
                <h4>Предварительный просмотр характеристик:</h4>
                <div class="preview-specs-list">
                  <div
                    v-for="(spec, idx) in previewedSpecs"
                    :key="idx"
                    class="preview-spec-item"
                  >
                    <strong>{{ spec.key }}:</strong> {{ spec.value }}
                  </div>
                </div>
              </div>
            </div>

            <table class="specs-table">
              <thead>
                <tr>
                  <th style="width: 40px"></th>
                  <th style="width: 40%">Параметр</th>
                  <th style="width: 40%">Значение</th>
                  <th style="width: 60px"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(spec, idx) in props.newSpecs"
                  :key="spec.id"
                  :draggable="true"
                  @dragstart="onDragStart($event, idx)"
                  @dragover.prevent
                  @drop="onDrop($event, idx)"
                  class="spec-row"
                  :class="{ dragging: draggedIndex === idx }"
                >
                  <td class="drag-handle">
                    <div class="drag-icon">⋮⋮</div>
                  </td>
                  <td>
                    <div class="spec-input-container">
                      <input
                        v-model="spec.key"
                        placeholder="Параметр"
                        @input="onSpecKeyInput(spec, $event)"
                        @focus="showSpecSuggestions(spec)"
                        @blur="hideSpecSuggestions"
                        class="form-control spec-input"
                      />
                      <div
                        v-if="
                          spec.showKeySuggestions &&
                          specKeySuggestions.length > 0
                        "
                        class="spec-suggestions"
                      >
                        <div
                          v-for="suggestion in specKeySuggestions"
                          :key="suggestion"
                          @click="selectSpecKey(spec, suggestion)"
                          class="spec-suggestion-item"
                        >
                          {{ suggestion }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="spec-input-container">
                      <input
                        v-model="spec.value"
                        placeholder="Значение"
                        @input="onSpecValueInput(spec, $event)"
                        @focus="showValueSuggestions(spec)"
                        @blur="hideValueSuggestions"
                        class="form-control spec-input"
                      />
                      <div
                        v-if="
                          spec.showValueSuggestions &&
                          specValueSuggestions.length > 0
                        "
                        class="spec-suggestions"
                      >
                        <div
                          v-for="suggestion in specValueSuggestions"
                          :key="suggestion"
                          @click="selectSpecValue(spec, suggestion)"
                          class="spec-suggestion-item"
                        >
                          {{ suggestion }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button class="btn-sm" @click.prevent="removeNewSpec(idx)">
                      <UiDeleteSmall />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <div class="spec-input-container">
                      <input
                        v-model="newSpecLocal.key"
                        placeholder="Новая характеристика"
                        @input="onNewSpecKeyInput($event)"
                        @focus="showNewSpecKeySuggestions"
                        @blur="hideNewSpecKeySuggestions"
                        class="form-control"
                      />
                      <div
                        v-if="
                          showNewSpecKeySuggestionsFlag &&
                          newSpecKeySuggestions.length > 0
                        "
                        class="spec-suggestions"
                      >
                        <div
                          v-for="suggestion in newSpecKeySuggestions"
                          :key="suggestion"
                          @click="selectNewSpecKey(suggestion)"
                          class="spec-suggestion-item"
                        >
                          {{ suggestion }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="spec-input-container">
                      <input
                        v-model="newSpecLocal.value"
                        placeholder="Значение"
                        @input="onNewSpecValueInput($event)"
                        @focus="showNewSpecValueSuggestions"
                        @blur="hideNewSpecValueSuggestions"
                        class="form-control"
                      />
                      <div
                        v-if="
                          showNewSpecValueSuggestionsFlag &&
                          newSpecValueSuggestions.length > 0
                        "
                        class="spec-suggestions"
                      >
                        <div
                          v-for="suggestion in newSpecValueSuggestions"
                          :key="suggestion"
                          @click="selectNewSpecValue(suggestion)"
                          class="spec-suggestion-item"
                        >
                          {{ suggestion }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button
                      class="btn btn-secondary btn-sm"
                      @click.prevent="addNewSpec"
                    >
                      Добавить
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Действия -->
        <div class="edit-section edit-section--actions">
          <div class="edit-section__content">
            <button
              class="btn btn-primary"
              @click="syncSpecsAndAddProduct"
              :disabled="!isFormValid"
              :class="{ 'btn--disabled': !isFormValid }"
            >
              {{
                isFormValid ? "Добавить товар" : "Заполните обязательные поля"
              }}
            </button>
            <div
              v-if="!isFormValid && showValidationErrors"
              class="validation-hint"
            >
              <p>Для добавления товара необходимо заполнить:</p>
              <ul>
                <li
                  v-if="
                    !newProdLocal.category ||
                    (newProdLocal.category === 'new' && !newCategoryLocal.name)
                  "
                >
                  • Категорию товара
                </li>
                <li
                  v-if="!newProdLocal.name || newProdLocal.name.trim() === ''"
                >
                  • Название товара
                </li>
                <li
                  v-if="
                    !newProdLocal.description ||
                    newProdLocal.description.trim() === ''
                  "
                >
                  • Краткое описание
                </li>
                <li v-if="!newProdLocal.price || newProdLocal.price <= 0">
                  • Цену (больше 0)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Список товаров с аккордеоном -->
      <div class="prod-list">
        <div
          v-for="p in products"
          :key="p.id"
          class="prod-item"
          draggable="true"
          @dragstart="onProductDragStart($event, p.id)"
          @dragover.prevent
          @drop="onProductDrop($event, p.id)"
          :class="{ dragging: draggedProductId === p.id }"
        >
          <!-- Сводная строка -->
          <div class="prod-summary" @click="toggle(p.id)">
            <div class="drag-handle">⋮⋮</div>
            <span class="prod-summary__id">{{ p.id }}</span>
            <span class="prod-summary__category">{{ p.category_name }}</span>
            <span class="prod-summary__name">{{ p.name }}</span>
            <span class="prod-summary__price">{{ p.price }} ₽</span>
            <button @click.stop="deleteProduct(p.id)"><UiDeleteSmall /></button>
          </div>

          <!-- Детальная форма редактирования -->
          <transition name="slide">
            <div v-if="activeId === p.id" class="prod-details">
              <!-- Основная информация -->
              <div class="edit-section">
                <h3 class="edit-section__title">Основная информация</h3>
                <div class="edit-section__content">
                  <div class="form-row">
                    <div class="form-group">
                      <label>Категория:</label>
                      <select v-model="p.category" class="form-control">
                        <option value="">Выберите категорию</option>
                        <option
                          v-for="cat in categories"
                          :key="cat.id"
                          :value="cat.name"
                        >
                          {{ cat.name }}
                        </option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Название:</label>
                      <input v-model="p.name" class="form-control" />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Краткое описание:</label>
                    <textarea
                      v-model="p.description"
                      rows="2"
                      class="form-control"
                    ></textarea>
                  </div>

                  <div class="form-group">
                    <label>Расширенное описание:</label>
                    <MarkdownEditor
                      :model-value="p.extendedDescription || ''"
                      @update:model-value="
                        (val) => (p.extendedDescription = val)
                      "
                    />
                  </div>

                  <div class="form-group">
                    <label>Цена (₽):</label>
                    <input
                      type="number"
                      v-model.number="p.price"
                      class="form-control"
                    />
                  </div>
                </div>
              </div>

              <!-- Изображения -->
              <div class="edit-section">
                <h3 class="edit-section__title">Изображения</h3>
                <div class="edit-section__content">
                  <div class="form-group">
                    <label>Основное изображение:</label>
                    <div class="image-upload">
                      <select
                        v-model="p.image"
                        class="image-select form-control"
                      >
                        <option value="">Выберите изображение</option>
                        <option
                          v-for="img in presetImages"
                          :key="img"
                          :value="img"
                        >
                          {{ img.split("/").pop() }}
                        </option>
                        <option value="custom">
                          Загрузить своё изображение
                        </option>
                      </select>
                      <input
                        v-if="p.image === 'custom'"
                        type="file"
                        accept="image/*"
                        @change="(e: any) => handleImageUpload(e, p)"
                        class="image-input"
                      />
                    </div>
                    <div
                      v-if="p.image && p.image !== 'custom'"
                      class="image-preview-container"
                    >
                      <img
                        :src="getImageUrl(p.image)"
                        class="img-preview"
                        alt="Основное изображение"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Дополнительные изображения:</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      @change="(e: Event) => handleEditGalleryUpload(e, p)"
                      class="form-control"
                    />
                    <div class="gallery-previews">
                      <div
                        v-for="(gimg, gidx) in (
                          editGalleryLocal[p.id] ||
                          p.additional_images ||
                          []
                        ).filter((img) => img && typeof img === 'string')"
                        :key="gidx"
                        class="gallery-item"
                      >
                        <img :src="getImageUrl(gimg)" class="img-preview" />
                        <button
                          class="btn btn-danger btn-sm gallery-remove-btn"
                          @click.prevent="removeEditGalleryImage(p, gidx)"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Дополнительная информация -->
              <div class="edit-section">
                <h3 class="edit-section__title">Дополнительная информация</h3>
                <div class="edit-section__content">
                  <div class="form-group">
                    <label>Комплект поставки:</label>
                    <textarea
                      v-model="p.delivery_set"
                      placeholder="Опишите комплект поставки товара"
                      rows="3"
                      class="form-control"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Характеристики -->
              <div class="edit-section">
                <h3 class="edit-section__title">Характеристики</h3>
                <div class="edit-section__content">
                  <table class="specs-table">
                    <thead>
                      <tr>
                        <th style="width: 40px"></th>
                        <th style="width: 40%">Параметр</th>
                        <th style="width: 40%">Значение</th>
                        <th style="width: 60px"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(spec, idx) in localSpecs[p.id] ||
                        filteredSpecs(p.id)"
                        :key="`${p.id}-${spec.id}-${idx}`"
                        :draggable="true"
                        @dragstart="onEditDragStart($event, p.id, idx)"
                        @dragover.prevent
                        @drop="onEditDrop($event, p.id, idx)"
                        class="spec-row"
                        :class="{
                          dragging:
                            draggedEditIndex === idx &&
                            draggedEditProductId === p.id,
                        }"
                      >
                        <td class="drag-handle">
                          <div class="drag-icon">⋮⋮</div>
                        </td>
                        <td>
                          <div class="spec-input-container">
                            <input
                              v-model="spec.key"
                              placeholder="Параметр"
                              @input="onEditSpecKeyInput(spec, $event)"
                              @focus="showEditSpecSuggestions(spec)"
                              @blur="hideEditSpecSuggestions"
                              class="form-control spec-input"
                            />
                            <div
                              v-if="
                                spec.showKeySuggestions &&
                                editSpecKeySuggestions.length > 0
                              "
                              class="spec-suggestions"
                            >
                              <div
                                v-for="suggestion in editSpecKeySuggestions"
                                :key="suggestion"
                                @click="selectEditSpecKey(spec, suggestion)"
                                class="spec-suggestion-item"
                              >
                                {{ suggestion }}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="spec-input-container">
                            <input
                              v-model="spec.value"
                              placeholder="Значение"
                              @input="onEditSpecValueInput(spec, $event)"
                              @focus="showEditValueSuggestions(spec)"
                              @blur="hideEditValueSuggestions"
                              class="form-control spec-input"
                            />
                            <div
                              v-if="
                                spec.showValueSuggestions &&
                                editSpecValueSuggestions.length > 0
                              "
                              class="spec-suggestions"
                            >
                              <div
                                v-for="suggestion in editSpecValueSuggestions"
                                :key="suggestion"
                                @click="selectEditSpecValue(spec, suggestion)"
                                class="spec-suggestion-item"
                              >
                                {{ suggestion }}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <button
                            class="delete-spec-btn"
                            @click.prevent="removeSpec(p.id, idx)"
                            title="Удалить характеристику"
                          >
                            <UiDeleteSmall />
                          </button>
                        </td>
                      </tr>
                      <tr class="new-spec-row">
                        <td></td>
                        <td colspan="2">
                          <button
                            class="btn btn-secondary btn-sm"
                            @click.prevent="addSpec(p.id)"
                          >
                            Добавить характеристику
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Дополнительные требования в форме редактирования -->
              <div class="edit-section">
                <h3 class="edit-section__title">Дополнительно потребуется</h3>
                <div class="edit-section__content">
                  <div class="form-group">
                    <label>Описание дополнительных требований:</label>
                    <textarea
                      v-model="p.additional_requirements"
                      placeholder="Опишите, что потребуется дополнительно"
                      rows="3"
                      class="form-control"
                    ></textarea>
                  </div>

                  <div class="form-group">
                    <label>Связанные товары:</label>
                    <select
                      v-model="selectedProduct"
                      class="form-control"
                      @change="(e) => addRequiredProductToExisting(e, p)"
                    >
                      <option value="">Выберите товар</option>
                      <option
                        v-for="prod in products.filter(
                          (prod) => prod.id !== p.id
                        )"
                        :key="prod.id"
                        :value="prod.id"
                      >
                        {{ prod.name }}
                      </option>
                    </select>

                    <div
                      v-if="
                        p.required_products && p.required_products.length > 0
                      "
                      class="required-products-list"
                    >
                      <div
                        v-for="prodId in p.required_products"
                        :key="prodId"
                        class="required-product-item"
                      >
                        <div class="required-product-item__info">
                          <img
                            :src="
                              getImageUrl(
                                products.find((prod) => prod.id === prodId)
                                  ?.image || ''
                              )
                            "
                            :alt="
                              products.find((prod) => prod.id === prodId)?.name
                            "
                            class="required-product-item__image"
                          />
                          <div class="required-product-item__details">
                            <span class="required-product-item__name">{{
                              products.find((prod) => prod.id === prodId)?.name
                            }}</span>
                            <span class="required-product-item__price"
                              >{{
                                products.find((prod) => prod.id === prodId)
                                  ?.price
                              }}
                              ₽</span
                            >
                          </div>
                        </div>
                        <button
                          class="required-product-item__remove"
                          @click="removeRequiredProductFromExisting(p, prodId)"
                          title="Удалить"
                        >
                          <UiDeleteSmall />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Действия -->
              <div class="edit-section edit-section--actions">
                <div class="prod-details__actions">
                  <button class="btn btn-primary" @click="updateWithSpecs(p)">
                    Сохранить изменения
                  </button>
                  <button class="btn btn-secondary" @click="cancelEdit">
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>

  <!-- Модальное окно подтверждения удаления характеристики -->
  <div
    v-if="showDeleteSpecModal"
    class="modal-overlay"
    @click="cancelDeleteSpec"
  >
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Подтверждение удаления</h3>
        <button class="close-button" @click="cancelDeleteSpec">&times;</button>
      </div>
      <div class="modal-body">
        <p>Вы уверены, что хотите удалить эту характеристику?</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="cancelDeleteSpec">
          Отмена
        </button>
        <button class="btn btn-danger" @click="confirmDeleteSpec">
          Удалить
        </button>
      </div>
    </div>
  </div>

  <!-- Модальное окно подтверждения удаления товара -->
  <div
    v-if="showDeleteProductModal"
    class="modal-overlay"
    @click="cancelDeleteProduct"
  >
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Подтверждение удаления товара</h3>
        <button class="close-button" @click="cancelDeleteProduct">
          &times;
        </button>
      </div>
      <div class="modal-body">
        <p>Вы уверены, что хотите удалить этот товар?</p>
        <p class="warning-text">Это действие нельзя отменить!</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="cancelDeleteProduct">
          Отмена
        </button>
        <button class="btn btn-danger" @click="confirmDeleteProduct">
          Удалить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useKesFileStorage } from "@/composables/useKesFileStorage";
import MarkdownEditor from "./MarkdownEditor.vue";

interface Spec {
  id: number;
  key: string;
  value: string;
  showKeySuggestions?: boolean;
  showValueSuggestions?: boolean;
  show_in_filters?: boolean;
}

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  extendedDescription?: string;
  price: number;
  image: string;
  category: string;
  category_name?: string;
  category_id?: string;
  category_slug?: string;
  slug: string;
  specs?: Characteristic[];
  additional_images?: string[];
  connection_scheme?: string;
  delivery_set?: string;
  additional_requirements?: string;
  required_products?: number[];
}

interface Characteristic {
  id: number;
  key: string;
  value: string;
  showKeySuggestions?: boolean;
  showValueSuggestions?: boolean;
  show_in_filters?: boolean;
}

// Props
const props = defineProps<{
  adminTab: string;
  authorized: boolean;
  password: string;
  loginError: string | null;
  products: Product[];
  categories: AdminCategory[];
  specsList: Record<number, Spec[]>;
  newProd: any;
  newCategory: any;
  activeId: number | null;
  newSpecs: Spec[];
  newSpec: Spec;
  newProdPowerValue: any;
  newProdPowerUnit: string;
  newProdSelectedFuels: any[];
  showNewProdFuelDropdown: boolean;
  powerUnits: string[];
  availableFuels: string[];
  presetImages: string[];
  newProdGallery: string[];
  isFormValid: boolean;
  modalStore: any;
  filteredSpecs: (id: number) => Spec[];
  setShowInFiltersForAll: (key: string, value: boolean) => void;
}>();

// Emits
const emit = defineEmits<{
  (e: "login"): void;
  (e: "logout"): void;
  (e: "addProduct"): void;
  (e: "resetForm"): void;
  (e: "toggle", ...args: any[]): void;
  (e: "updateWithSpecs", ...args: any[]): void;
  (e: "cancelEdit"): void;
  (e: "addSpec", ...args: any[]): void;
  (e: "removeSpec", ...args: any[]): void;
  (e: "addNewSpec"): void;
  (e: "removeNewSpec", ...args: any[]): void;
  (e: "delete-product", ...args: any[]): void;
  (e: "handleImageUpload", ...args: any[]): void;
  (e: "toggleNewProdFuelDropdown"): void;
  (e: "handleGalleryUpload", ...args: any[]): void;
  (e: "removeGalleryImage", ...args: any[]): void;
  (e: "removeEditGalleryImage", ...args: any[]): void;
  (e: "handleEditGalleryUpload", ...args: any[]): void;
  (e: "handleConnectionSchemeUpload", ...args: any[]): void;
  (e: "update:password", ...args: any[]): void;
  (e: "update:newCategory", ...args: any[]): void;
  (e: "update:newProdPowerValue", ...args: any[]): void;
  (e: "update:newProdPowerUnit", ...args: any[]): void;
  (e: "update:newProdSelectedFuels", ...args: any[]): void;
  (e: "update:newProd", ...args: any[]): void;
  (e: "update:newSpec", ...args: any[]): void;
  (e: "update:newSpecs", ...args: any[]): void;
  (e: "updateSpecsList", ...args: any[]): void;
  (e: "update:newProdGallery", ...args: any[]): void;
  (e: "updateWithSpecs", product: Product): void;
  (e: "removeSpec", productId: number, specIndex: number): void;
  (e: "addSpec", id: number): void;
  (e: "removeNewSpec", idx: number): void;
  (e: "delete-product", id: number): void;
  (e: "updateSpecsList", productId: number, specs: Spec[]): void;
}>();

// Локальная переменная для пароля
const passwordLocal = ref(props.password);
watch(
  () => props.password,
  (val) => {
    passwordLocal.value = val;
  }
);
watch(passwordLocal, (val) => {
  emit("update:password", val);
});

// Локальная переменная для newCategory
const newCategoryLocal = ref(props.newCategory);
watch(
  () => props.newCategory,
  (val) => {
    newCategoryLocal.value = val;
  }
);
watch(newCategoryLocal, (val) => {
  emit("update:newCategory", val);
});
watch(
  () => newCategoryLocal.value.name,
  () => {
    validateNewCategory();
  }
);

// Локальные переменные для power и fuel props
const newProdPowerValueLocal = ref(props.newProdPowerValue);
watch(
  () => props.newProdPowerValue,
  (val) => {
    newProdPowerValueLocal.value = val;
  }
);
watch(newProdPowerValueLocal, (val) => {
  emit("update:newProdPowerValue", val);
});

const newProdPowerUnitLocal = ref(props.newProdPowerUnit);
watch(
  () => props.newProdPowerUnit,
  (val) => {
    newProdPowerUnitLocal.value = val;
  }
);
watch(newProdPowerUnitLocal, (val) => {
  emit("update:newProdPowerUnit", val);
});

const newProdSelectedFuelsLocal = ref(props.newProdSelectedFuels);
watch(
  () => props.newProdSelectedFuels,
  (val) => {
    newProdSelectedFuelsLocal.value = val;
  }
);
watch(newProdSelectedFuelsLocal, (val) => {
  emit("update:newProdSelectedFuels", val);
});

// Локальные переменные для newProd, newSpec, newSpecs
const newProdLocal = ref(props.newProd);
watch(
  () => props.newProd,
  (val) => {
    newProdLocal.value = val;
  }
);
watch(newProdLocal, (val) => {
  emit("update:newProd", val);
});

const newSpecLocal = ref(props.newSpec);
watch(
  () => props.newSpec,
  (val) => {
    newSpecLocal.value = val;
  }
);
watch(newSpecLocal, (val) => {
  emit("update:newSpec", val);
});

// Initialize additional requirements if not present
if (!newProdLocal.value.additional_requirements) {
  newProdLocal.value.additional_requirements = "";
}
if (!newProdLocal.value.required_products) {
  newProdLocal.value.required_products = [];
}

// Selected product for additional requirements
const selectedProduct = ref("");

// Add required product
const addRequiredProduct = () => {
  if (!selectedProduct.value) return;

  const productId = Number(selectedProduct.value);
  if (!newProdLocal.value.required_products?.includes(productId)) {
    if (!newProdLocal.value.required_products) {
      newProdLocal.value.required_products = [];
    }
    newProdLocal.value.required_products.push(productId);
  }
  selectedProduct.value = "";
};

// Remove required product
const removeRequiredProduct = (productId: number) => {
  if (!newProdLocal.value.required_products) return;
  newProdLocal.value.required_products =
    newProdLocal.value.required_products.filter(
      (id: number) => id !== productId
    );
};

// Переменные для системы подсказок
const selectedProductForCopy = ref("");
const specKeySuggestions = ref<string[]>([]);
const specValueSuggestions = ref<string[]>([]);
const newSpecKeySuggestions = ref<string[]>([]);
const newSpecValueSuggestions = ref<string[]>([]);
const showNewSpecKeySuggestionsFlag = ref(false);
const showNewSpecValueSuggestionsFlag = ref(false);

// Переменные для подсказок в редактировании
const editSpecKeySuggestions = ref<string[]>([]);
const editSpecValueSuggestions = ref<string[]>([]);

// Переменные для предварительного просмотра характеристик
const previewedSpecs = ref<{ key: string; value: string }[]>([]);

// Получение всех уникальных ключей характеристик из существующих товаров
const getAllSpecKeys = computed(() => {
  const keys = new Set<string>();
  props.products.forEach((product) => {
    if (product.specs && Array.isArray(product.specs)) {
      product.specs.forEach((spec) => {
        if (spec.key) {
          keys.add(spec.key);
        }
      });
    }
  });
  return Array.from(keys).sort();
});

// Получение всех уникальных значений для конкретного ключа
const getSpecValuesForKey = (key: string) => {
  const values = new Set<string>();
  props.products.forEach((product) => {
    if (product.specs && Array.isArray(product.specs)) {
      product.specs.forEach((spec) => {
        if (spec.key === key && spec.value) {
          values.add(spec.value);
        }
      });
    }
  });
  return Array.from(values).sort();
};

// Предварительный просмотр характеристик из существующего товара
const previewSpecsFromProduct = () => {
  if (!selectedProductForCopy.value) {
    clearPreview();
    return;
  }

  const product = props.products.find(
    (p) => p.id === Number(selectedProductForCopy.value)
  );
  if (!product || !product.specs || !Array.isArray(product.specs)) {
    clearPreview();
    return;
  }

  // Подготавливаем характеристики для предварительного просмотра
  previewedSpecs.value = product.specs.map((spec) => ({
    key: spec.key,
    value: spec.value,
  }));
};

// Подтверждение копирования характеристик
const confirmCopySpecs = () => {
  // Очищаем текущие характеристики
  props.newSpecs.splice(0, props.newSpecs.length);
  // Копируем характеристики с id
  previewedSpecs.value.forEach((spec, index) => {
    props.newSpecs.push({
      id: index + 1,
      key: spec.key,
      value: spec.value,
      showKeySuggestions: false,
      showValueSuggestions: false,
      show_in_filters: false,
    });
  });
  emit("update:newSpecs", [...props.newSpecs]);
  clearCopySelection();
};

// Очистка выбора товара для копирования
const clearCopySelection = () => {
  selectedProductForCopy.value = "";
  clearPreview();
};

// Очистка предварительного просмотра
const clearPreview = () => {
  previewedSpecs.value = [];
};

// Обработчики для подсказок ключей характеристик
const onSpecKeyInput = (spec: any, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.toLowerCase();

  if (value.length > 0) {
    specKeySuggestions.value = getAllSpecKeys.value.filter((key) =>
      key.toLowerCase().includes(value)
    );
  } else {
    specKeySuggestions.value = getAllSpecKeys.value;
  }
};

const showSpecSuggestions = (spec: any) => {
  spec.showKeySuggestions = true;
  specKeySuggestions.value = getAllSpecKeys.value;
};

const hideSpecSuggestions = () => {
  setTimeout(() => {
    specKeySuggestions.value = [];
    props.newSpecs.forEach((spec) => {
      spec.showKeySuggestions = false;
    });
  }, 200);
};

const selectSpecKey = (spec: any, key: string) => {
  spec.key = key;
  spec.showKeySuggestions = false;
  specKeySuggestions.value = [];
};

// Обработчики для подсказок значений характеристик
const onSpecValueInput = (spec: any, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.toLowerCase();

  if (spec.key) {
    const allValues = getSpecValuesForKey(spec.key);
    if (value.length > 0) {
      specValueSuggestions.value = allValues.filter((val) =>
        val.toLowerCase().includes(value)
      );
    } else {
      specValueSuggestions.value = allValues;
    }
  }
};

const showValueSuggestions = (spec: Spec) => {
  spec.showValueSuggestions = true;
  if (spec.key) {
    specValueSuggestions.value = getSpecValuesForKey(spec.key);
  }
};

const hideValueSuggestions = () => {
  setTimeout(() => {
    specValueSuggestions.value = [];
    props.newSpecs.forEach((spec) => {
      spec.showValueSuggestions = false;
    });
  }, 200);
};

const selectSpecValue = (spec: Spec, value: string) => {
  spec.value = value;
  spec.showValueSuggestions = false;
  specValueSuggestions.value = [];
};

// Обработчики для новой характеристики
const onNewSpecKeyInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.toLowerCase();

  if (value.length > 0) {
    newSpecKeySuggestions.value = getAllSpecKeys.value.filter((key) =>
      key.toLowerCase().includes(value)
    );
  } else {
    newSpecKeySuggestions.value = getAllSpecKeys.value;
  }
};

const showNewSpecKeySuggestions = () => {
  showNewSpecKeySuggestionsFlag.value = true;
  newSpecKeySuggestions.value = getAllSpecKeys.value;
};

const hideNewSpecKeySuggestions = () => {
  setTimeout(() => {
    showNewSpecKeySuggestionsFlag.value = false;
    newSpecKeySuggestions.value = [];
  }, 200);
};

const selectNewSpecKey = (key: string) => {
  newSpecLocal.value.key = key;
  showNewSpecKeySuggestionsFlag.value = false;
  newSpecKeySuggestions.value = [];
};

const onNewSpecValueInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.toLowerCase();

  if (newSpecLocal.value.key) {
    const allValues = getSpecValuesForKey(newSpecLocal.value.key);
    if (value.length > 0) {
      newSpecValueSuggestions.value = allValues.filter((val) =>
        val.toLowerCase().includes(value)
      );
    } else {
      newSpecValueSuggestions.value = allValues;
    }
  }
};

const showNewSpecValueSuggestions = () => {
  showNewSpecValueSuggestionsFlag.value = true;
  if (newSpecLocal.value.key) {
    newSpecValueSuggestions.value = getSpecValuesForKey(newSpecLocal.value.key);
  }
};

const hideNewSpecValueSuggestions = () => {
  setTimeout(() => {
    showNewSpecValueSuggestionsFlag.value = false;
    newSpecValueSuggestions.value = [];
  }, 200);
};

const selectNewSpecValue = (value: string) => {
  newSpecLocal.value.value = value;
  showNewSpecValueSuggestionsFlag.value = false;
  newSpecValueSuggestions.value = [];
};

// Обработчики для подсказок в редактировании
const onEditSpecKeyInput = (spec: Spec, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.toLowerCase();

  if (value.length > 0) {
    editSpecKeySuggestions.value = getAllSpecKeys.value.filter((key) =>
      key.toLowerCase().includes(value)
    );
  } else {
    editSpecKeySuggestions.value = getAllSpecKeys.value;
  }
};

const showEditSpecSuggestions = (spec: Spec) => {
  spec.showKeySuggestions = true;
  editSpecKeySuggestions.value = getAllSpecKeys.value;
};

const hideEditSpecSuggestions = () => {
  setTimeout(() => {
    editSpecKeySuggestions.value = [];
    // Очищаем флаги для всех характеристик в редактировании
    props.products.forEach((product) => {
      if (product.specs && Array.isArray(product.specs)) {
        product.specs.forEach((spec) => {
          spec.showKeySuggestions = false;
        });
      }
    });
  }, 200);
};

const selectEditSpecKey = (spec: Spec, key: string) => {
  spec.key = key;
  spec.showKeySuggestions = false;
  editSpecKeySuggestions.value = [];
};

const onEditSpecValueInput = (spec: Spec, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.toLowerCase();

  if (spec.key) {
    const allValues = getSpecValuesForKey(spec.key);
    if (value.length > 0) {
      editSpecValueSuggestions.value = allValues.filter((val) =>
        val.toLowerCase().includes(value)
      );
    } else {
      editSpecValueSuggestions.value = allValues;
    }
  }
};

const showEditValueSuggestions = (spec: Spec) => {
  spec.showValueSuggestions = true;
  if (spec.key) {
    editSpecValueSuggestions.value = getSpecValuesForKey(spec.key);
  }
};

const hideEditValueSuggestions = () => {
  setTimeout(() => {
    editSpecValueSuggestions.value = [];
    // Очищаем флаги для всех характеристик в редактировании
    props.products.forEach((product) => {
      if (product.specs && Array.isArray(product.specs)) {
        product.specs.forEach((spec) => {
          spec.showValueSuggestions = false;
        });
      }
    });
  }, 200);
};

const selectEditSpecValue = (spec: Spec, value: string) => {
  spec.value = value;
  spec.showValueSuggestions = false;
  editSpecValueSuggestions.value = [];
};

// Обработчик изменений флажка show_in_filters
const onShowInFiltersChange = (
  productId: number,
  specIndex: number,
  event: Event
) => {
  const target = event.target as HTMLInputElement | null;
  if (!target) return;
  const value = target.checked;
  if (props.specsList[productId] && props.specsList[productId][specIndex]) {
    const key = props.specsList[productId][specIndex].key;
    if (typeof props.setShowInFiltersForAll === "function") {
      props.setShowInFiltersForAll(key, value);
    }
  }
};

// Methods
const login = () => {
  emit("login");
};
const addProduct = () => {
  emit("addProduct");
};
const resetForm = () => emit("resetForm");
const toggle = (id: number) => {
  // Инициализируем галерею при начале редактирования
  const product = props.products.find((p) => p.id === id);
  if (product) {
    initializeEditGallery(id, product.additional_images || []);
    // Инициализируем характеристики
    if (product.specs) {
      localSpecs.value[id] = product.specs.map((spec) => ({
        ...spec,
        showKeySuggestions: false,
        showValueSuggestions: false,
      }));
    }
  }
  emit("toggle", id);
};
const updateWithSpecs = (product: Product) => {
  // Получаем актуальные характеристики из localSpecs
  if (localSpecs.value[product.id]) {
    product.specs = [...localSpecs.value[product.id]];
  }
  // Очищаем локальную галерею после сохранения
  delete editGalleryLocal.value[product.id];
  emit("updateWithSpecs", product);
};
const cancelEdit = () => {
  // Очищаем локальную галерею при отмене редактирования
  editGalleryLocal.value = {};
  // Очищаем локальные характеристики
  if (props.activeId) {
    delete localSpecs.value[props.activeId];
  }
  emit("cancelEdit");
};
const addSpec = (id: number) => emit("addSpec", id);
const removeSpec = (productId: number, specIndex: number) => {
  pendingDeleteSpecData.value = { productId, specIndex };
  showDeleteSpecModal.value = true;
};
const addNewSpec = () => {
  if (newSpecLocal.value.key && newSpecLocal.value.value) {
    const newId =
      props.newSpecs.length > 0
        ? Math.max(...props.newSpecs.map((s) => s.id)) + 1
        : 1;

    props.newSpecs.push({
      id: newId,
      key: newSpecLocal.value.key,
      value: newSpecLocal.value.value,
      showKeySuggestions: false,
      showValueSuggestions: false,
      show_in_filters: false,
    });
    newSpecLocal.value.key = "";
    newSpecLocal.value.value = "";
  }
};
const removeNewSpec = (idx: number) => emit("removeNewSpec", idx);
const deleteProduct = (id: number) => {
  pendingDeleteProductId.value = id;
  showDeleteProductModal.value = true;
};
const handleImageUpload = (event: Event, product: Product | Partial<Product>) =>
  emit("handleImageUpload", event, product);
const toggleNewProdFuelDropdown = () => emit("toggleNewProdFuelDropdown");
const removeEditGalleryImage = (product: Product, idx: number) => {
  // Инициализируем галерею, если её нет
  if (!editGalleryLocal.value[product.id]) {
    initializeEditGallery(product.id, product.additional_images || []);
  }

  // Удаляем изображение из локальной галереи
  removeEditGalleryImageLocal(product.id, idx);

  // Обновляем additional_images в продукте
  product.additional_images = [...editGalleryLocal.value[product.id]];
};

const handleEditGalleryUpload = async (event: Event, product: Product) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const files = Array.from(input.files);

  // Инициализируем галерею, если её нет
  if (!editGalleryLocal.value[product.id]) {
    initializeEditGallery(product.id, product.additional_images || []);
  }

  try {
    const filePaths = await uploadFiles(files);

    // Добавляем новые изображения в локальную галерею
    addEditGalleryImages(product.id, filePaths);

    // Обновляем additional_images в продукте
    product.additional_images = [...editGalleryLocal.value[product.id]];
  } catch (error) {
    console.error("Error uploading gallery images for edit:", error);
  }

  // Очищаем input
  input.value = "";
};
const handleConnectionSchemeUpload = (event: Event, product: Product) =>
  emit("handleConnectionSchemeUpload", event, product);

function onPasswordInput(e: Event) {
  const target = e.target as HTMLInputElement | null;
  if (target) passwordLocal.value = target.value;
}

function onNewCategoryInput(e: Event) {
  const target = e.target as HTMLInputElement | null;
  if (target) newCategoryLocal.value.name = target.value;
}

const validateNewCategory = () => {
  if (
    newCategoryLocal.value.name &&
    props.categories.some((c) => c.name === newCategoryLocal.value.name)
  ) {
    newProdLocal.value.category = newCategoryLocal.value.name;
    newCategoryLocal.value.name = "";
  }
};

// Состояние для валидации
const showValidationErrors = ref(false);

// Валидация формы добавления товара
const isFormValid = computed(() => {
  // Проверяем базовые обязательные поля
  const hasCategory =
    newProdLocal.value.category &&
    (newProdLocal.value.category !== "new" || newCategoryLocal.value.name);
  const hasName =
    newProdLocal.value.name && newProdLocal.value.name.trim() !== "";
  const hasDescription =
    newProdLocal.value.description &&
    newProdLocal.value.description.trim() !== "";
  const hasValidPrice =
    newProdLocal.value.price && newProdLocal.value.price > 0;

  return hasCategory && hasName && hasDescription && hasValidPrice;
});

// Функция для показа ошибок валидации
const showValidation = () => {
  showValidationErrors.value = true;
};

// Функция для скрытия ошибок валидации
const hideValidation = () => {
  showValidationErrors.value = false;
};

// Состояние редактора
const showPreview = ref(false);
const extendedDescriptionTextarea = ref<HTMLTextAreaElement | null>(null);

// Общие функции для редактирования markdown
function insertTextIntoTextarea(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string = ""
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end);

  const beforeText = text.substring(0, start);
  const afterText = text.substring(end);

  const newText = beforeText + before + selectedText + after + afterText;
  textarea.value = newText;

  // Восстанавливаем фокус и выделение
  nextTick(() => {
    textarea.focus();
    textarea.setSelectionRange(start + before.length, end + before.length);
  });

  // Вызываем событие input для обновления v-model
  textarea.dispatchEvent(new Event("input"));
}

// Функции для работы с markdown
function insertMarkdownHeading(textarea: HTMLTextAreaElement, level: number) {
  const prefix = "#".repeat(level) + " ";
  insertTextIntoTextarea(textarea, prefix);
}

function insertMarkdownBold(textarea: HTMLTextAreaElement) {
  insertTextIntoTextarea(textarea, "**", "**");
}

function insertMarkdownItalic(textarea: HTMLTextAreaElement) {
  insertTextIntoTextarea(textarea, "*", "*");
}

function insertMarkdownList(textarea: HTMLTextAreaElement) {
  insertTextIntoTextarea(textarea, "- ");
}

// Функции для работы с редактором
function getEditorTextarea(event: Event): HTMLTextAreaElement | null {
  const target = event.target as HTMLElement;
  const editor = target.closest(".extended-description-editor");
  return editor?.querySelector("textarea") || null;
}

// Функции для работы с редактором нового товара
function insertHeading(level: number) {
  if (!extendedDescriptionTextarea.value) return;
  insertMarkdownHeading(extendedDescriptionTextarea.value, level);
}

function insertBold() {
  if (!extendedDescriptionTextarea.value) return;
  insertMarkdownBold(extendedDescriptionTextarea.value);
}

function insertItalic() {
  if (!extendedDescriptionTextarea.value) return;
  insertMarkdownItalic(extendedDescriptionTextarea.value);
}

function insertList() {
  if (!extendedDescriptionTextarea.value) return;
  insertMarkdownList(extendedDescriptionTextarea.value);
}

// Функции для работы с редактором существующего товара
function insertEditHeading(product: Product, level: number, event: Event) {
  const textarea = getEditorTextarea(event);
  if (!textarea) return;
  insertMarkdownHeading(textarea, level);
  product.extendedDescription = textarea.value;
}

function insertEditBold(product: Product, event: Event) {
  const textarea = getEditorTextarea(event);
  if (!textarea) return;
  insertMarkdownBold(textarea);
  product.extendedDescription = textarea.value;
}

function insertEditItalic(product: Product, event: Event) {
  const textarea = getEditorTextarea(event);
  if (!textarea) return;
  insertMarkdownItalic(textarea);
  product.extendedDescription = textarea.value;
}

function insertEditList(product: Product, event: Event) {
  const textarea = getEditorTextarea(event);
  if (!textarea) return;
  insertMarkdownList(textarea);
  product.extendedDescription = textarea.value;
}

function togglePreview() {
  showPreview.value = !showPreview.value;
}

// Функция для предварительного просмотра
function parseMarkdown(text: string | undefined): string {
  if (!text) return "";

  const lines = text.split("\n");
  let html = "";
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += "<br>";
      continue;
    }

    if (line.startsWith("### ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      const text = line.substring(4);
      html += `<h3>${parseInlineMarkdown(text)}</h3>`;
    } else if (line.startsWith("## ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      const text = line.substring(3);
      html += `<h2>${parseInlineMarkdown(text)}</h2>`;
    } else if (line.startsWith("# ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      const text = line.substring(2);
      html += `<h1>${parseInlineMarkdown(text)}</h1>`;
    } else if (line.startsWith("- ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      const text = line.substring(2);
      html += `<li>${parseInlineMarkdown(text)}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<p>${parseInlineMarkdown(line)}</p>`;
    }
  }

  if (inList) {
    html += "</ul>";
  }

  return html;
}

function parseInlineMarkdown(text: string): string {
  // Обработка жирного текста
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Обработка курсива
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
  return text;
}

// Функция для создания вычисляемого свойства для extendedDescription
function useExtendedDescription(product: Product) {
  return computed({
    get: () => product.extendedDescription || "",
    set: (value: string) => {
      product.extendedDescription = value;
    },
  });
}

// Functions for handling required products
const addRequiredProductToExisting = (event: Event, product: Product) => {
  const target = event.target as HTMLSelectElement;
  const productId = Number(target.value);
  if (!productId) return;

  if (!product.required_products) {
    product.required_products = [];
  }

  if (!product.required_products.includes(productId)) {
    product.required_products.push(productId);
  }

  target.value = ""; // Reset select
};

const removeRequiredProductFromExisting = (
  product: Product,
  productId: number
) => {
  if (!product.required_products) return;
  product.required_products = product.required_products.filter(
    (id: number) => id !== productId
  );
};

// Drag & Drop функциональность для характеристик
const draggedIndex = ref<number | null>(null);
const draggedEditIndex = ref<number | null>(null);
const draggedEditProductId = ref<number | null>(null);

// Drag & Drop для новых характеристик
const onDragStart = (event: DragEvent, index: number) => {
  draggedIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", index.toString());
  }
};

const onDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault();
  if (draggedIndex.value === null || draggedIndex.value === dropIndex) return;

  const specs = [...props.newSpecs];
  const draggedSpec = specs[draggedIndex.value];
  specs.splice(draggedIndex.value, 1);
  specs.splice(dropIndex, 0, draggedSpec);

  // Обновляем ID для правильного порядка
  specs.forEach((spec, index) => {
    spec.id = index + 1;
  });
  props.newSpecs.splice(0, props.newSpecs.length, ...specs);
  // props.newSpecs = specs
  draggedIndex.value = null;
};

// Drag & Drop для редактирования характеристик
const onEditDragStart = (
  event: DragEvent,
  productId: number,
  index: number
) => {
  draggedEditIndex.value = index;
  draggedEditProductId.value = productId;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", `${productId}-${index}`);
  }
};

// Функция для обработки перетаскивания характеристик
function handleSpecsDragDrop(
  productId: number,
  fromIndex: number,
  toIndex: number
) {
  const currentSpecs = props.filteredSpecs(productId);
  if (!currentSpecs || currentSpecs.length === 0) return;

  const specs = [...currentSpecs];
  const [movedSpec] = specs.splice(fromIndex, 1);
  specs.splice(toIndex, 0, movedSpec);

  // Создаем новый массив с обновленными характеристиками, сохраняя оригинальные ID
  const updatedSpecs = specs.map((spec) => ({
    ...spec,
    showKeySuggestions: false,
    showValueSuggestions: false,
  }));

  // Обновляем specsList через emit
  emit("updateSpecsList", productId, updatedSpecs);
}

// Метод для обработки перемещения характеристик
const handleSpecReorder = (
  productId: number,
  fromIndex: number,
  toIndex: number
) => {
  // Получаем текущие характеристики
  const currentSpecs = props.filteredSpecs(productId);
  if (!currentSpecs || currentSpecs.length === 0) return;

  // Создаем новый массив и перемещаем элемент
  const newSpecs = [...currentSpecs];
  const [movedSpec] = newSpecs.splice(fromIndex, 1);
  newSpecs.splice(toIndex, 0, movedSpec);

  // Обновляем порядок
  const updatedSpecs = newSpecs.map((spec, index) => ({
    ...spec,
    order: index, // Добавляем порядковый номер
  }));

  // Находим продукт
  const product = props.products.find((p) => p.id === productId);
  if (!product) return;

  // Обновляем specsList и продукт
  nextTick(() => {
    emit("updateSpecsList", productId, updatedSpecs);
    emit("updateWithSpecs", {
      ...product,
      specs: updatedSpecs,
    });
  });
};

// Локальное состояние для характеристик
const localSpecs = ref<Record<number, Spec[]>>({});

// Следим за изменениями specsList
watch(
  () => props.specsList,
  (newSpecsList) => {
    localSpecs.value = JSON.parse(JSON.stringify(newSpecsList));
  },
  { deep: true, immediate: true }
);

// Инициализация локальных характеристик при открытии редактирования
watch(
  () => props.activeId,
  (newId) => {
    if (newId !== null) {
      const specs = props.filteredSpecs(newId);
      localSpecs.value[newId] = [...specs];
    }
  }
);

// Обновляем функцию onEditDrop
const onEditDrop = (event: DragEvent, productId: number, dropIndex: number) => {
  event.preventDefault();
  event.stopPropagation();

  if (
    draggedEditIndex.value === null ||
    draggedEditIndex.value === dropIndex ||
    draggedEditProductId.value !== productId
  )
    return;

  // Работаем с локальной копией характеристик
  if (!localSpecs.value[productId]) {
    localSpecs.value[productId] = [...props.filteredSpecs(productId)];
  }

  const specs = localSpecs.value[productId];
  const [movedSpec] = specs.splice(draggedEditIndex.value, 1);
  specs.splice(dropIndex, 0, movedSpec);

  // Обновляем порядок
  localSpecs.value[productId] = specs.map((spec, index) => ({
    ...spec,
    id: index + 1,
    key: spec.key,
    value: spec.value,
    show_in_filters: spec.show_in_filters || false,
    showKeySuggestions: false,
    showValueSuggestions: false,
  }));

  // Обновляем specsList
  emit("updateSpecsList", productId, localSpecs.value[productId]);

  // Обновляем продукт
  const product = props.products.find((p) => p.id === productId);
  if (product) {
    emit("updateWithSpecs", {
      ...product,
      specs: localSpecs.value[productId],
      keepOpen: true, // Добавляем флаг, чтобы форма не закрывалась
    });
  }

  draggedEditIndex.value = null;
  draggedEditProductId.value = null;
};

const rememberMe = ref(false);

const logout = () => {
  emit("logout");
};

// Добавляю метод для удаления основного изображения
const removeMainImage = () => {
  newProdLocal.value.image = "";
};

const newProdGalleryLocal = ref([...props.newProdGallery]);

watch(
  () => props.newProdGallery,
  (val) => {
    newProdGalleryLocal.value = [...val];
  }
);

const addGalleryImages = (images: string[]) => {
  newProdGalleryLocal.value.push(...images);
  emit("update:newProdGallery", [...newProdGalleryLocal.value]);
};

const removeGalleryImage = (idx: number) => {
  newProdGalleryLocal.value.splice(idx, 1);
  emit("update:newProdGallery", [...newProdGalleryLocal.value]);
};

const handleGalleryUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  const files = Array.from(input.files);
  try {
    const filePaths = await uploadFiles(files);
    addGalleryImages(filePaths);
  } catch (error) {
    console.error("Error uploading gallery images:", error);
  }
  input.value = "";
};

const { uploadFiles } = useKesFileStorage();

const getImageUrl = (path: string) => {
  if (!path || typeof path !== "string") return "";
  if (path.startsWith("/api/uploads/")) return path;
  if (path.startsWith("/uploads/"))
    return path.replace("/uploads/", "/api/uploads/");
  return `/api/uploads/${path.replace(/^\/+/, "")}`;
};

// Для основного изображения
const {
  files: mainImageFiles,
  handleFileInput: handleMainImageInput,
  uploadFiles: uploadMainImageFiles,
} = useKesFileStorage({ clearOldFiles: true });

// Для галереи
const {
  files: galleryFiles,
  handleFileInput: handleGalleryInput,
  uploadFiles: uploadGalleryFiles,
} = useKesFileStorage({ clearOldFiles: true });

// Функция для загрузки основного изображения
const uploadMainImage = async () => {
  if (!mainImageFiles.value.length) return;
  const paths = await uploadMainImageFiles(mainImageFiles.value);
  newProdLocal.value.image = paths[0] || "";
};

// Функция для загрузки галереи
const uploadGallery = async () => {
  if (!galleryFiles.value.length) return;
  const paths = await uploadGalleryFiles(galleryFiles.value);
  addGalleryImages(paths);
};

// Добавьте функцию для сброса характеристик
function resetNewSpecsLocal() {
  props.newSpecs.splice(0, props.newSpecs.length);
}

function syncSpecsAndAddProduct() {
  emit("update:newSpecs", [...props.newSpecs]);
  nextTick(() => {
    showValidation();
    addProduct();
  });
}

// Drag & Drop для товаров
const draggedProductId = ref<number | null>(null);

const onProductDragStart = (event: DragEvent, productId: number) => {
  draggedProductId.value = productId;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", productId.toString());
  }
};

const onProductDrop = async (event: DragEvent, targetId: number) => {
  event.preventDefault();
  if (!draggedProductId.value || draggedProductId.value === targetId) return;

  try {
    // Отправляем запрос на сервер для изменения порядка
    const response = await fetch("/api/products/reorder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: draggedProductId.value,
        targetId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to reorder products");
    }

    // Обновляем список товаров после успешного изменения порядка
    const productsResponse = await fetch("/api/products");
    const data = await productsResponse.json();
    props.products.splice(0, props.products.length, ...data.products);
  } catch (error) {
    console.error("Error reordering products:", error);
    // Здесь можно добавить уведомление об ошибке
  }

  draggedProductId.value = null;
};

// Локальные переменные для галереи в режиме редактирования
const editGalleryLocal = ref<Record<number, string[]>>({});

// Инициализируем галерею для каждого товара при редактировании
const initializeEditGallery = (
  productId: number,
  additionalImages: any = []
) => {
  // Проверяем тип additionalImages и преобразуем в массив
  let imagesArray: string[] = [];

  if (additionalImages) {
    if (Array.isArray(additionalImages)) {
      imagesArray = additionalImages.filter(
        (img) => typeof img === "string" && img
      );
    } else if (typeof additionalImages === "string") {
      imagesArray = [additionalImages];
    } else if (typeof additionalImages === "object") {
      // Если это объект, попробуем извлечь массив
      const keys = Object.keys(additionalImages);
      if (keys.length > 0) {
        imagesArray = keys
          .map((key) => additionalImages[key])
          .filter((img) => typeof img === "string" && img);
      }
    }
  }

  editGalleryLocal.value[productId] = [...imagesArray];
};

// Функции для работы с галереей в режиме редактирования
const addEditGalleryImages = (productId: number, images: string[]) => {
  if (!editGalleryLocal.value[productId]) {
    editGalleryLocal.value[productId] = [];
  }
  editGalleryLocal.value[productId].push(...images);
};

const removeEditGalleryImageLocal = (productId: number, idx: number) => {
  if (editGalleryLocal.value[productId]) {
    editGalleryLocal.value[productId].splice(idx, 1);
  }
};

// Добавляем watch для отслеживания изменений specsList
watch(
  () => props.specsList,
  (newSpecsList) => {
    console.log("SpecsList updated:", newSpecsList);
  },
  { deep: true }
);

// Состояние для модальных окон
const showDeleteSpecModal = ref(false);
const showDeleteProductModal = ref(false);
const pendingDeleteSpecData = ref<{
  productId: number;
  specIndex: number;
} | null>(null);
const pendingDeleteProductId = ref<number | null>(null);

// Функции для модального окна удаления характеристики
const cancelDeleteSpec = () => {
  showDeleteSpecModal.value = false;
  pendingDeleteSpecData.value = null;
};

const confirmDeleteSpec = () => {
  if (!pendingDeleteSpecData.value) return;

  const { productId, specIndex } = pendingDeleteSpecData.value;

  // Удаляем из локального состояния
  if (localSpecs.value[productId]) {
    localSpecs.value[productId].splice(specIndex, 1);
  }

  // Обновляем родительское состояние
  emit("updateSpecsList", productId, localSpecs.value[productId] || []);

  // Обновляем продукт на сервере
  const product = props.products.find((p) => p.id === productId);
  if (product) {
    emit("updateWithSpecs", {
      ...product,
      specs: localSpecs.value[productId] || [],
      keepOpen: true,
    });
  }

  // Закрываем модальное окно
  cancelDeleteSpec();
};

// Функции для модального окна удаления товара
const cancelDeleteProduct = () => {
  showDeleteProductModal.value = false;
  pendingDeleteProductId.value = null;
};

const confirmDeleteProduct = () => {
  if (!pendingDeleteProductId.value) return;

  emit("delete-product", pendingDeleteProductId.value);
  cancelDeleteProduct();
};
</script>

<style lang="scss" scoped>
.login-box {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: var(--bg);
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.login-box h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
  color: var(--text);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  color: white;
}

.login-box input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid var(--secondary);
  border-radius: 0.5rem;
  font-size: 0.95rem;
  z-index: 10000;
}

@media (min-width: 768px) {
  .login-box input {
    font-size: 1rem;
  }
}

.login-box button {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.95rem;
}

@media (min-width: 768px) {
  .login-box button {
    font-size: 1rem;
  }
}

.login-box .error {
  color: #dc3545;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.catalog-manager {
  h1 {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    text-align: center;
    color: var(--text);

    @media (min-width: 768px) {
      font-size: 2rem;
    }
  }
}

.add-form {
  background: var(--bg);
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .edit-section {
    background: var(--bg-light);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
    overflow: visible !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    &__title {
      background: var(--primary);
      color: white;
      margin: 0;
      padding: 1rem 1.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      border-bottom: 1px solid var(--border);
      border-radius: 0.5rem 0.5rem 0 0;
    }

    &__content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      z-index: 1;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        display: block;
        margin-bottom: 0.25rem;
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--text);
      }

      label.required::after {
        content: " *";
        color: #dc2626;
        font-weight: bold;
      }

      .form-control {
        padding: 0.75rem;
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        font-size: 0.95rem;
        background: var(--bg);
        color: var(--text);
        transition: border-color 0.2s ease, box-shadow 0.2s ease,
          background-color 0.2s ease, color 0.2s ease;

        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
        }

        &::placeholder {
          color: var(--text-light);
        }

        &.required-field {
          border-color: #dc2626;
          background-color: #fef2f2;

          &:focus {
            border-color: #dc2626;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
          }
        }
      }

      textarea.form-control {
        min-height: 80px;
        resize: vertical;
        font-family: inherit;
      }

      select.form-control {
        cursor: pointer;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 0.5rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        padding-right: 2.5rem;
      }

      .category-input {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .image-upload {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .image-select {
          margin-bottom: 0.5rem;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
          background-position: right 0.5rem center !important;
          background-repeat: no-repeat !important;
          background-size: 1.5em 1.5em !important;
          padding-right: 2.5rem !important;
        }

        .image-input {
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background: var(--bg);
          color: var(--text);
        }
      }
    }

    .image-preview-container {
      margin-top: 0.5rem;
      display: flex;
      justify-content: center;

      .img-preview {
        max-width: 200px;
        max-height: 150px;
        border-radius: 0.5rem;
        border: 2px solid var(--border);
        object-fit: contain;
        padding: 0.5rem;
        background: #f8f9fa;
      }
    }

    .gallery-previews {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.75rem;
      margin-top: 0.75rem;

      .gallery-item {
        position: relative;
        border-radius: 0.5rem;
        overflow: hidden;
        border: 2px solid var(--border);
        background: #f8f9fa;
        min-height: 100px;

        .img-preview {
          width: 100%;
          height: 100px;
          object-fit: contain;
          display: block;
          padding: 0.5rem;
        }

        .gallery-remove-btn {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          background: rgba(220, 38, 38, 0.9);
          border: none;
          color: white;
          cursor: pointer;
          transition: transform 0.2s ease, background-color 0.2s ease;
          z-index: 10;

          &:hover {
            background: rgb(220, 38, 38);
            transform: scale(1.1);
          }
        }
      }
    }

    .specs-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.5rem;
      overflow: visible !important;

      th {
        padding: 0.5rem;
        text-align: left;
        font-weight: 600;
        color: var(--text);
        border-bottom: 2px solid var(--border);
      }

      td {
        padding: 0.5rem;
        vertical-align: top;

        &:last-child {
          width: 50px;
          text-align: center;
        }
      }

      .drag-handle {
        width: 40px;
        text-align: center;
        cursor: grab;

        &:active {
          cursor: grabbing;
        }
      }

      .drag-icon {
        color: var(--text-light);
        font-size: 1.2rem;
        user-select: none;
        cursor: grab;

        &:active {
          cursor: grabbing;
        }
      }

      .spec-row {
        transition: background-color 0.2s ease;

        &:hover {
          background-color: rgba(var(--primary-rgb), 0.05);
        }

        &.dragging {
          opacity: 0.5;
          background-color: rgba(var(--primary-rgb), 0.1);
        }
      }

      .spec-input-container {
        position: relative;
        width: 100%;

        .form-control {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 0.25rem;
          font-size: 0.9rem;
          background: var(--bg);
          color: var(--text);

          &:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
          }
        }
      }
    }

    .edit-section--actions {
      background: var(--bg);
      border: 1px solid var(--primary);

      .edit-section__title {
        background: var(--primary);
        border-radius: 0.5rem;
      }
    }
  }
}

.prod-list {
  .prod-item {
    background: var(--bg);
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: grab;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;

    &.dragging {
      opacity: 0.5;
      transform: scale(0.98);
    }

    &:active {
      cursor: grabbing;
    }
  }

  .prod-summary {
    display: flex;
    align-items: center;
    padding: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .drag-handle {
      margin-right: 1rem;
      color: var(--text-light);
      cursor: grab;
      user-select: none;

      &:active {
        cursor: grabbing;
      }
    }

    &__id {
      width: 50px;
      font-size: 0.9rem;
      color: var(--secondary);
    }

    &__category {
      width: 120px;
      font-size: 0.9rem;
      color: var(--primary);
      margin-right: 1rem;
    }

    &__name {
      flex: 1;
      font-size: 1rem;
      color: var(--text);
      margin: 0 1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__price {
      font-weight: 600;
      color: var(--accent);
      margin-right: 1rem;
      font-size: 0.95rem;
    }

    &__delete {
      padding: 0.5rem;
      font-size: 0.9rem;
    }
  }

  .prod-details {
    padding: 1.5rem;
    border-top: 1px solid var(--secondary);

    .edit-section {
      background: var(--bg-light);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
      overflow: visible !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      &__title {
        background: var(--primary);
        color: white;
        margin: 0;
        padding: 1rem 1.5rem;
        font-size: 1.1rem;
        font-weight: 600;
        border-bottom: 1px solid var(--border);
        border-radius: 0.5rem 0.5rem 0 0;
      }

      &__content {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        z-index: 1;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
          display: block;
          margin-bottom: 0.25rem;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text);
        }

        .form-control {
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          font-size: 0.95rem;
          background: var(--bg);
          color: var(--text);
          transition: border-color 0.2s ease, box-shadow 0.2s ease,
            background-color 0.2s ease, color 0.2s ease;

          &:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
          }

          &::placeholder {
            color: var(--text-light);
          }

          &.required-field {
            border-color: #dc2626;
            background-color: #fef2f2;

            &:focus {
              border-color: #dc2626;
              box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
            }
          }
        }

        textarea.form-control {
          min-height: 80px;
          resize: vertical;
          font-family: inherit;
        }

        select.form-control {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
      }

      .image-upload {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .image-select {
          margin-bottom: 0.5rem;
        }

        .image-input {
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background: var(--bg);
          color: var(--text);
        }
      }

      .image-preview-container {
        margin-top: 0.5rem;
        display: flex;
        justify-content: center;

        .img-preview {
          max-width: 200px;
          max-height: 150px;
          border-radius: 0.5rem;
          border: 2px solid var(--border);
          object-fit: contain;
          padding: 0.5rem;
          background: #f8f9fa;
        }
      }

      .gallery-previews {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 0.75rem;
        margin-top: 0.75rem;

        .gallery-item {
          position: relative;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 2px solid var(--border);
          background: #f8f9fa;
          min-height: 100px;

          .img-preview {
            width: 100%;
            height: 100px;
            object-fit: contain;
            display: block;
            padding: 0.5rem;
          }

          .gallery-remove-btn {
            position: absolute;
            top: 0.25rem;
            right: 0.25rem;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            background: rgba(220, 38, 38, 0.9);
            border: none;
            color: white;
            cursor: pointer;
            transition: transform 0.2s ease, background-color 0.2s ease;
            z-index: 10;

            &:hover {
              background: rgb(220, 38, 38);
              transform: scale(1.1);
            }
          }
        }
      }

      .specs-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 0.5rem;
        overflow: visible !important;

        th {
          padding: 0.5rem;
          text-align: left;
          font-weight: 600;
          color: var(--text);
          border-bottom: 2px solid var(--border);
        }

        td {
          padding: 0.5rem;
          vertical-align: top;

          &:last-child {
            width: 50px;
            text-align: center;
          }
        }

        .drag-handle {
          width: 40px;
          text-align: center;
          cursor: grab;

          &:active {
            cursor: grabbing;
          }
        }

        .drag-icon {
          color: var(--text-light);
          font-size: 1.2rem;
          user-select: none;
          cursor: grab;

          &:active {
            cursor: grabbing;
          }
        }

        .spec-row {
          transition: background-color 0.2s ease;

          &:hover {
            background-color: rgba(var(--primary-rgb), 0.05);
          }

          &.dragging {
            opacity: 0.5;
            background-color: rgba(var(--primary-rgb), 0.1);
          }
        }

        .spec-input-container {
          position: relative;
          width: 100%;

          .form-control {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid var(--border);
            border-radius: 0.25rem;
            font-size: 0.9rem;
            background: var(--bg);
            color: var(--text);

            &:focus {
              outline: none;
              border-color: var(--primary);
              box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
            }
          }
        }
      }

      .prod-details__actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
        margin-top: 1rem;

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: background-color 0.2s ease, transform 0.2s ease,
            box-shadow 0.2s ease;
          cursor: pointer;
          border: none;
          font-size: 0.95rem;
          color: white;
          min-width: 120px;

          &.btn-primary {
            background: var(--primary);
            color: white;

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
            }

            &:active {
              transform: translateY(0);
              box-shadow: 0 2px 6px rgba(var(--primary-rgb), 0.3);
            }
          }

          &.btn-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;

            &:hover {
              background: #e5e7eb;
              border-color: #9ca3af;
              transform: translateY(-1px);
            }

            &:active {
              transform: translateY(0);
            }
          }

          &.btn-danger {
            background: #dc2626;
            color: white;

            &:hover {
              background: #b91c1c;
              transform: translateY(-1px);
            }

            &:active {
              transform: translateY(0);
            }
          }
        }
      }
    }
  }
}

// Анимации
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fuel-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.fuel-option {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
  width: 100%;

  &:hover {
    background-color: rgba(var(--primary-rgb), 0.1);
  }

  label {
    cursor: pointer;
    flex: 1;
    margin-bottom: 0;
    position: relative;
    padding-right: 25px;
  }

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    width: 0;
    height: 0;
  }

  input[type="checkbox"]:checked + label::after {
    content: "✔";
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    color: var(--primary);
    font-size: 1.2em;
    display: block;
  }
}

.fuel-dropdown-container {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
}

.fuel-dropdown-header {
  border: 1px solid var(--secondary);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  background-color: var(--bg);
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s ease, box-shadow 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: var(--primary);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  &::after {
    content: "▼";
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8em;
    color: var(--text-light);
    transition: transform 0.2s ease;
  }
}

.fuel-dropdown-content {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background-color: var(--bg);
  border: 1px solid var(--secondary);
  border-radius: 0.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 10;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.fuel-dropdown-content .fuel-option {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
  width: 100%;

  &:hover {
    background-color: rgba(var(--primary-rgb), 0.1);
  }

  label {
    cursor: pointer;
    flex: 1;
    margin-bottom: 0;
    position: relative;
    padding-right: 25px;
  }

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    width: 0;
    height: 0;
  }

  input[type="checkbox"]:checked + label::after {
    content: "✔";
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    color: var(--primary);
    font-size: 1.2em;
    display: block;
  }
}

.optional-specs {
  margin: 20px 0;
  padding: 15px;
  border: 1px dashed #ddd;
  border-radius: 4px;
}

.optional-specs .filter-group {
  margin-bottom: 15px;
}

.optional-specs label {
  color: #666;
  font-style: italic;
}

/* Стили для системы подсказок характеристик */
.quick-specs-copy {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 0.5rem;
  border: 1px solid var(--border);
}

.quick-specs-copy label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text);
}

.copy-controls {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.copy-controls .form-control {
  flex: 1;
  min-width: 200px;
  position: relative;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.copy-controls .btn {
  white-space: nowrap;
}

.preview-specs {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.preview-specs h4 {
  margin: 0 0 1rem 0;
  color: var(--text);
  font-size: 1rem;
}

.preview-specs-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.preview-spec-item {
  padding: 0.5rem;
  background: var(--bg-light);
  border-radius: 0.25rem;
  font-size: 0.9rem;
  border-left: 3px solid var(--primary);
}

.preview-power,
.preview-fuels {
  padding: 0.5rem;
  background: var(--bg-light);
  border-radius: 0.25rem;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  border-left: 3px solid var(--accent);
}

.spec-input-container {
  position: relative;
  width: 100%;
}

.spec-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}
/* From Uiverse.io by SelfMadeSystem */
.remember-me__label {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin: 0;
  cursor: pointer;
}

.remember-me__label input {
  display: none;
}

.container svg {
  overflow: visible;
}

.path {
  fill: none;
  stroke: var(--primary);
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease;
  stroke-dasharray: 241 9999999;
  stroke-dashoffset: 0;
}

.container input:checked ~ svg .path {
  stroke-dasharray: 70.5096664428711 9999999;
  stroke-dashoffset: -262.2723388671875;
}

.spec-suggestion-item {
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--bg-light);
  }

  &:first-child {
    border-radius: 0.5rem 0.5rem 0 0;
  }

  &:last-child {
    border-radius: 0 0 0.5rem 0.5rem;
  }
}

.spec-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.95rem;
  background: var(--bg);
  color: var(--text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease,
    background-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
  }

  &:hover {
    border-color: var(--primary);
  }

  &::placeholder {
    color: var(--text-light);
  }
}

.drag-handle {
  width: 40px;
  text-align: center;
  vertical-align: middle;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.drag-icon {
  font-size: 1.2rem;
  color: var(--text-light);
  user-select: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--primary);
  }
}

.specs-table {
  border-collapse: collapse;
  width: 100%;

  th,
  td {
    padding: 0.75rem;
    border: 1px solid var(--border);
    vertical-align: middle;
  }

  th {
    background: var(--bg-light);
    font-weight: 600;
    color: var(--text);
  }

  tbody tr {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--bg-light);
    }
  }

  .new-spec-row {
    background: var(--bg-light);

    td {
      border-top: 2px solid var(--primary);
    }
  }
}

.btn--disabled {
  background-color: #ccc !important;
  border-color: #999 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.validation-hint {
  margin-top: 1rem;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 0.5rem;
  color: #856404;
  font-size: 0.9rem;

  p {
    margin: 0 0 0.5rem 0;
    font-weight: 600;
  }

  ul {
    margin: 0;
    padding-left: 1.5rem;

    li {
      margin: 0.25rem 0;
    }
  }
}

// Стили для required-product-item
.required-product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: var(--primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  &__image {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 0.25rem;
    flex-shrink: 0;
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
  }

  &__name {
    font-weight: 600;
    color: var(--text);
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__price {
    font-size: 0.9rem;
    color: var(--primary);
    font-weight: 500;
  }

  &__remove {
    background: none;
    border: none;
    color: #dc3545;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s ease, color 0.2s ease,
      transform 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background: #f8d7da;
      color: #721c24;
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

.required-products-list {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 0.5rem;
  border: 1px solid var(--border);
}

@media (max-width: 768px) {
  .required-product-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;

    &__info {
      width: 100%;
    }

    &__remove {
      align-self: flex-end;
    }
  }
}

.remember-me {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  &__label {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  &__checkbox {
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  &__text {
    color: var(--text);
    font-size: 0.9rem;
  }
}

.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.5rem;
    margin-bottom: 0;
  }

  .logout-btn {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: background-color 0.2s ease, color 0.2s ease,
      transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
    border: none;
    font-size: 0.95rem;
    min-width: 120px;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(var(--primary-rgb), 0.3);
    }
  }
}

.delete-spec-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-spec-btn:hover {
  opacity: 0.7;
}

.delete-spec-btn:active {
  opacity: 0.5;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
}

.close-button:hover {
  color: #333;
}

.warning-text {
  color: #dc3545;
  margin-top: 0.5rem;
  font-weight: 500;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #5a6268;
}
</style>
