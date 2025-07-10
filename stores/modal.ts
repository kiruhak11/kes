import { defineStore } from "pinia";
import BaseModal from "~/components/BaseModal.vue";
import CategoryForm from "~/components/CategoryForm.vue";
import CertificateModal from "~/components/CertificateModal.vue";

export const useModalStore = defineStore("modal", () => {
  const isOpen = ref(false);
  const title = ref("");
  const text = ref("");
  const buttonText = ref("Закрыть");
  const onButtonClick = ref<(() => void) | null>(null);

  const modal = process.client
    ? useFrogModal({
        closeOnOverlayClick: false,
        closeOnEsc: false,
      })
    : {
        setModal: () => {},
        closeModal: () => {},
      };

  function openModal(
    modalTitle: string,
    modalText: string,
    modalButtonText?: string,
    onButtonClick?: () => void
  ) {
    modal.setModal(BaseModal, {
      modalTitle,
      modalText,
      modalButtonText: modalButtonText || "Закрыть",
      onButtonClick: onButtonClick || (() => {}),
    });
  }

  function showSuccess(text: string) {
    openModal("Успех", text);
  }

  function showError(text: string) {
    openModal("Ошибка", text);
  }

  function showConfirm(text: string, onConfirm: () => void) {
    openModal("Подтверждение", text, "Подтвердить", onConfirm);
  }

  function showCategoryForm(
    isEdit: boolean,
    category?: {
      id?: string;
      title: string;
      description: string;
      slug: string;
    },
    onSave?: (categoryData: any) => void
  ) {
    modal.setModal(CategoryForm, {
      isEdit,
      category,
      onSave: onSave || (() => {}),
    });
  }

  function showCertificateModal(
    certificate: any,
    currentIndex: number,
    totalCount: number,
    onPrevious?: () => void,
    onNext?: () => void,
    onClose?: () => void
  ) {
    modal.setModal(CertificateModal, {
      certificate,
      currentIndex,
      totalCount,
      onPrevious: onPrevious || (() => {}),
      onNext: onNext || (() => {}),
      onClose: onClose || (() => {}),
    });
  }

  function closeModal() {
    modal.closeModal();
  }

  return {
    isOpen,
    title,
    text,
    buttonText,
    onButtonClick,
    openModal,
    showSuccess,
    showError,
    showConfirm,
    showCategoryForm,
    showCertificateModal,
    closeModal,
  };
});
