<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <header class="modal-header">
        <h2 class="modal-title">{{ modalTitle }}</h2>
        <button class="modal-close" @click="closeModal">×</button>
      </header>
      <div class="modal-body">
        <p>{{ modalText }}</p>
      </div>
      <footer class="modal-footer">
        <button class="full" @click="handleButtonClick">
          {{ modalButtonText }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setModal, closeModal, clearModals, isOpen } = process.client
  ? useFrogModal()
  : {
      setModal: () => {},
      closeModal: () => {},
      clearModals: () => {},
      isOpen: ref(false),
    };
const props = defineProps({
  modalTitle: {
    type: String,
    default: "Заголовок",
  },
  modalText: {
    type: String,
    default: "Основной текст",
  },
  modalButtonText: {
    type: String,
    default: "Закрыть",
  },
  onButtonClick: {
    type: Function,
    default: null,
  },
});

const handleButtonClick = () => {
  if (typeof props.onButtonClick === "function") {
    props.onButtonClick();
  }
  closeModal();
};
</script>

<style scoped>
.full {
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  color: #333;
  border-radius: 12px;
  box-shadow: 0 10px 20px #333;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-header {
  background: #f5f5f5;
  color: #333;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #e31e24;
}

.modal-body {
  padding: 20px;
  font-size: 1rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.modal-footer {
  padding: 16px;
  text-align: right;
  border-top: 1px solid #333;
}

.modal-button:hover {
  background: #0056b3;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
