<template>
  <!-- Статистика -->
  <div>
    <h1>Статистика посещений и заявок</h1>
    <div v-if="loading" class="loading-state">
      <UiLoader />
    </div>
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button class="btn btn-primary" @click="$emit('fetch-stats')">Повторить</button>
    </div>
    <div v-else class="stats-section">
      <!-- Статистика посещений -->
      <div class="stats-overview">
        <div class="stats-card">
          <h3>Посещения сегодня</h3>
          <div class="stats-value">{{ stats.visits.today }}</div>
        </div>
        <div class="stats-card">
          <h3>За неделю</h3>
          <div class="stats-value">{{ stats.visits.week }}</div>
        </div>
        <div class="stats-card">
          <h3>За месяц</h3>
          <div class="stats-value">{{ stats.visits.month }}</div>
        </div>
        <div class="stats-card">
          <h3>Всего</h3>
          <div class="stats-value">{{ stats.visits.total }}</div>
        </div>
      </div>
      <!-- График посещений -->
      <div class="stats-chart">
        <canvas id="visitsChart"></canvas>
      </div>
      <!-- Статистика заявок -->
      <div class="stats-requests">
        <h2>Заявки</h2>
        <button class="btn btn-danger" style="margin-bottom: 1rem;" @click="$emit('delete-all-requests')">
          Удалить все заявки
        </button>
        <!-- Статистика по типам заявок -->
        <div class="request-stats">
          <div class="stats-card" v-for="(count, type) in stats.requests.stats" :key="type">
            <h3>{{ type === 'order' ? 'Заказы' : 'Контакты' }}</h3>
            <div class="stats-value">{{ count }}</div>
          </div>
        </div>
        <!-- Таблица заявок -->
        <div v-if="stats.requests.list.length === 0" class="no-data">
          <p>Нет данных о заявках</p>
        </div>
        <div v-else class="table-container">
          <table class="requests-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тип</th>
                <th>Телефон</th>
                <th>Регион</th>
                <th>Тип здания</th>
                <th>Топливо</th>
                <th>Тип мощности</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="request in stats.requests.list" 
                :key="request.id" 
                @click="$emit('show-request-details', request)" 
                class="clickable-row"
                style="cursor: pointer;"
              >
                <td>{{ new Date(request.created_at).toLocaleDateString() }}</td>
                <td>{{ request.type === 'calculation' ? 'Заказ' : 'Консультация' }}</td>
                <td>{{ request.phone }}</td>
                <td>{{ request.region }}</td>
                <td>{{ request.type_building }}</td>
                <td>{{ request.fuel_type }}</td>
                <td>{{ request.power_type }}</td>
                <td>{{ request.status }}</td>
                <td>
                  <UiDeleteSmall @click.stop="$emit('delete-request', request.id)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- Модальное окно с деталями заявки -->
    <div v-if="selectedRequest" class="modal-overlay" @click="$emit('close-request-details')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Детали заявки</h2>
          <button class="close-button" @click="$emit('close-request-details')">&times;</button>
        </div>
        <div class="modal-body">
          <div class="request-details">
            <div class="detail-row">
              <span class="detail-label">Тип:</span>
              <span class="detail-value">{{ selectedRequest.type === 'calculation' ? 'Заказ' : 'Консультация' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Телефон:</span>
              <span class="detail-value">{{ selectedRequest.phone }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Регион:</span>
              <span class="detail-value">{{ selectedRequest.region }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Тип здания:</span>
              <span class="detail-value">{{ selectedRequest.type_building }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Топливо:</span>
              <span class="detail-value">{{ selectedRequest.fuel_type }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Мощность:</span>
              <span class="detail-value">{{ selectedRequest.power_type }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Статус:</span>
              <span class="detail-value">{{ selectedRequest.status }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Дата:</span>
              <span class="detail-value">{{ new Date(selectedRequest.created_at).toLocaleString() }}</span>
            </div>
            <div class="detail-row full-width">
              <span class="detail-label">Текст заявки:</span>
              <div class="detail-value text-content">{{ selectedRequest.raw_text }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

interface Request {
  id: number
  type: string
  phone: string
  region?: string
  type_building?: string
  fuel_type?: string
  power_type?: string
  status: string
  raw_text?: string
  created_at: string
}

interface Stats {
  visits: {
    today: number
    week: number
    month: number
    total: number
  }
  requests: {
    list: Request[]
    stats: Record<string, number>
  }
}

const props = defineProps({
  stats: {
    type: Object as PropType<Stats>,
    required: true
  },
  loading: Boolean,
  error: String,
  visits: Array,
  requests: Array,
  selectedRequest: {
    type: Object as PropType<Request | null>,
    required: false,
    default: null
  }
})
</script>

<style scoped>
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
.stats-chart {
  width: 100%;
  max-width: 100%;
  margin-bottom: 1rem;
}
.stats-requests {
  width: 100%;
}
.request-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
.table-container {
  width: 100%;
  overflow-x: auto;
  margin-top: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
}
.requests-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.requests-table th, 
.requests-table td {
  border: 1px solid #eee;
  padding: 8px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}
.requests-table th {
  background: #f5f5f5;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}
.requests-table td {
  vertical-align: top;
}
.requests-table tr:hover {
  background-color: #f9f9f9;
}
@media (max-width: 768px) {
  .table-container {
    margin: 0 -1rem;
    border-radius: 0;
  }
  
  .requests-table th,
  .requests-table td {
    max-width: none;
  }
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}
.loading-state .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--secondary);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}
.loading-state p {
  color: var(--text-light);
  font-size: 1.1rem;
}
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}
.error-state .error-message {
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}
.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
  font-size: 1.1rem;
  background: var(--bg);
  border-radius: 0.5rem;
  margin-top: 1rem;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Стили для карточек статистики */
.stats-card {
  background: var(--bg);
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;

  h3 {
    font-size: 1rem;
    color: var(--text-light);
    margin-bottom: 0.5rem;
  }

  .stats-value {
    font-size: 2rem;
    font-weight: 600;
    color: var(--primary);
  }
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
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
}

.modal-body {
  padding: 1rem;
}

.request-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.detail-row.full-width {
  flex-direction: column;
}

.detail-label {
  font-weight: 600;
  min-width: 120px;
  color: #666;
}

.detail-value {
  flex: 1;
}

.text-content {
  white-space: pre-wrap;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.clickable-row {
  cursor: pointer !important;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f0f0f0;
}
</style> 