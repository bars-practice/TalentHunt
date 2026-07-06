import { type ReactNode, createContext, useContext, useState } from "react";

export interface ModalItem {
  id: string;
  isOpen: boolean;
  content: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  width?: string;
}

export interface OpenModalOptions {
  title?: string;
  width?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

interface ModalContextType {
  modals: ModalItem[];
  openModal: (content: ReactNode, options?: OpenModalOptions) => void;
  closeModal: () => void;
  setModalOpen: (id: string, isOpen: boolean) => void;
  updateModal: (id: string, updates: Partial<Omit<ModalItem, "id" | "content">>) => void;
  updateLastModal: (updates: Partial<Omit<ModalItem, "id" | "content">>) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalItem[]>([]);

  const openModal = (newContent: ReactNode, options?: OpenModalOptions) => {
    const id = Math.random().toString(36).substring(7);

    setModals((prev) => [
      ...prev,
      {
        id,
        content: newContent,
        isOpen: false,
        ...options
      }
    ]);

    setTimeout(() => {
      setModals((prev) => prev.map((modal) => (modal.id === id ? { ...modal, isOpen: true } : modal)));
    }, 10);
  };

  const closeModal = () => {
    setModals((prev) => {
      if (prev.length === 0) return prev;
      const lastModal = prev[prev.length - 1];
      const updated = prev.map((modal) => (modal.id === lastModal.id ? { ...modal, isOpen: false } : modal));

      setTimeout(() => {
        setModals((current) => current.filter((m) => m.id !== lastModal.id));
      }, 150);
      return updated;
    });
  };

  const setModalOpen = (id: string, isOpen: boolean) => {
    setModals((prev) => prev.map((modal) => (modal.id === id ? { ...modal, isOpen } : modal)));
  };

  const updateModal = (id: string, updates: Partial<Omit<ModalItem, "id" | "content">>) => {
    setModals((prev) => prev.map((modal) => (modal.id === id ? { ...modal, ...updates } : modal)));
  };

  const updateLastModal = (updates: Partial<Omit<ModalItem, "id" | "content">>) => {
    setModals((prev) => {
      if (prev.length === 0) return prev;
      const lastModal = prev[prev.length - 1];
      return prev.map((modal) => (modal.id === lastModal.id ? { ...modal, ...updates } : modal));
    });
  };

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal, setModalOpen, updateModal, updateLastModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
}
