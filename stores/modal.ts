import { defineStore } from 'pinia'
import BaseModal from '~/components/BaseModal.vue'
import CategoryForm from '~/components/CategoryForm.vue'

export const useModalStore = defineStore('modal', {
  state: () => ({
    isOpen: false,
    title: '',
    text: '',
    buttonText: 'Закрыть',
    onButtonClick: null as (() => void) | null
  }),

  actions: {
    openModal(
      modalTitle: string,
      modalText: string,
      modalButtonText?: string,
      onButtonClick?: () => void
    ) {
      const modal = useFrogModal({
        closeOnOverlayClick: false,
        closeOnEsc: false,
      })
      
      modal.setModal(BaseModal, {
        modalTitle,
        modalText,
        modalButtonText: modalButtonText || 'Закрыть',
        onButtonClick: onButtonClick || (() => {})
      })
    },

    showSuccess(text: string) {
      this.openModal('Успех', text)
    },

    showError(text: string) {
      this.openModal('Ошибка', text)
    },

    showConfirm(text: string, onConfirm: () => void) {
      this.openModal('Подтверждение', text, 'Подтвердить', onConfirm)
    },

    showCategoryForm(
      isEdit: boolean,
      category?: {
        id?: string,
        title: string,
        description: string,
        slug: string
      },
      onSave?: (categoryData: any) => void
    ) {
      const modal = useFrogModal({
        closeOnOverlayClick: false,
        closeOnEsc: false,
      })
      
      modal.setModal(CategoryForm, {
        isEdit,
        category,
        onSave: onSave || (() => {})
      })
    }
  }
})