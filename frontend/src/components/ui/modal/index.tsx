import { useModal } from "@/providers/ModalProvider";
import { ArrowLeft, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SimpleBar from "simplebar-react";
import styles from "./styles.module.css";

function Modal() {
  const { modals, closeModal } = useModal();
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [wasOpen, setWasOpen] = useState(false);
  const mouseDownOnBackdrop = useRef(false);

  useEffect(() => {
    if (modals.length > 0) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      setWasOpen(true);
    } else if (wasOpen) {
      const timeout = setTimeout(() => {
        document.body.style.overflow = "";
        setWasOpen(false);
      }, 150);

      return () => {
        clearTimeout(timeout);
        document.body.style.overflow = "";
      };
    }

    return () => {
      document.body.style.overflow = "";
      previousActiveElement.current?.focus();
    };
  }, [modals.length, wasOpen]);

  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      mouseDownOnBackdrop.current = true;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && mouseDownOnBackdrop.current) {
      closeModal();
    }
    mouseDownOnBackdrop.current = false;
  };

  const handleContentMouseDown = () => {
    mouseDownOnBackdrop.current = false;
  };

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modals.length > 0) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [modals.length, closeModal]);

  if (modals.length === 0 && !wasOpen) {
    return null;
  }

  return createPortal(
    modals.map((modal, index) => (
      <div
        key={modal.id}
        className={`${styles.modal} ${modal.isOpen ? styles.modalOpen : ""}`}
        style={{ zIndex: 1000 + index }}
        onMouseDown={index === modals.length - 1 ? handleBackdropMouseDown : undefined}
        onClick={index === modals.length - 1 ? handleBackdropClick : undefined}
      >
        <div
          className={`${styles.modalContent} ${modal.isOpen ? styles.modalContentOpen : ""}`}
          style={{ width: modal.width || "400px" }}
          role="dialog"
          tabIndex={-1}
          onMouseDown={handleContentMouseDown}
        >
          {modal.showBackButton && (
            <button type="button" className={styles.backButton} onClick={modal.onBackClick} aria-label="Go back">
              <ArrowLeft size={24} />
            </button>
          )}
          <button type="button" className={styles.closeButton} onClick={closeModal} aria-label="Close modal">
            <X size={24} />
          </button>

          <SimpleBar className={styles.modalScrollBody}>
            {modal.title && <h2 className={styles.modalTitle}>{modal.title}</h2>}
            <div className={styles.modalInnerContent}>
              {modal.content}
            </div>
          </SimpleBar>
        </div>
      </div>
    )),
    document.body,
  );
}

export default Modal;
