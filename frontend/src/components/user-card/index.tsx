import { MoreVertical } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
import { useModal } from "@/providers/ModalProvider";
import Button from "@/components/ui/button";
import styles from "./styles.module.css";

interface UserCardProps {
  name: string;
  status: "active" | "inactive";
  role: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
}
const STATUS_CONFIG = {
  active: { text: "АКТИВЕН", variant: "success" as const },
  inactive: { text: "УДАЛЕН", variant: "danger" as const },
};

export function UserCard({
  name,
  status,
  role,
  canEdit = true,
  canDelete = true,
  canRestore = true,
  onEdit,
  onDelete,
  onRestore,
}: UserCardProps) {
  const badge = STATUS_CONFIG[status];
  const { openModal, closeModal } = useModal();

  const handleDeleteClick = () => {
    openModal(
      <div className={styles.modalContent}>
        <p className={styles.modalDescription}>
          Пользователь будет удален из системы.
        </p>
        <div className={styles.modalActions}>
          <Button variant="outline" onClick={closeModal}>
            Отмена
          </Button>
          <Button variant="danger" onClick={() => {
            onDelete?.();
            closeModal();
          }}>
            Удалить
          </Button>
        </div>
      </div>,
      { title: "Удалить пользователя?", width: "400px" }
    );
  };

  const hasActions =
    (status === "active" && (canEdit || canDelete)) ||
    (status === "inactive" && canRestore);

  return (
    <div className={styles.userCard}>
      <div className={styles.userInfo}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{name}</span>
          <StatusBadge text={badge.text} variant={badge.variant} />
        </div>
        <div className={styles.detailsRow}>
          <span className={styles.role}>{role}</span>
        </div>
      </div>

      {hasActions && (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger className={styles.menuButton}>
            <MoreVertical size={20} />
          </MenubarTrigger>
          <MenubarContent align="end">
            {status === "active" && (
              <>
                {canEdit && <MenubarItem onClick={onEdit}>Изменить пользователя</MenubarItem>}
                {canDelete && (
                  <MenubarItem variant="destructive" onClick={handleDeleteClick}>
                    Удалить пользователя
                  </MenubarItem>
                )}
              </>
            )}
            {status === "inactive" && canRestore && (
              <MenubarItem onClick={onRestore}>Восстановить пользователя</MenubarItem>
            )}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      )}
    </div>
  );
}