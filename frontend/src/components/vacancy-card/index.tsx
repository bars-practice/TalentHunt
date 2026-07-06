import { MoreVertical, MapPin, Users, UserPlus } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useModal } from "@/providers/ModalProvider";
import Button from "@/components/ui/button";
import styles from "./styles.module.css";

interface VacancyCardProps {
  title: string;
  level: string;
  businessUnit: string;
  location: string;
  responsesCount: number;
  status: "active" | "inactive";
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onAddResponse?: () => void;
  onExpand?: () => void;
  isExpanded?: boolean;
  responses?: Array<{ id: string; name: string }>;
}

const STATUS_CONFIG = {
  active: { text: "АКТИВНА", variant: "success" as const },
  inactive: { text: "УДАЛЕНА", variant: "danger" as const },
};

export function VacancyCard({
  title,
  location,
  responsesCount,
  status,
  onEdit,
  onDelete,
  onRestore,
  onAddResponse,
  responses = [],
}: VacancyCardProps) {
  const badge = STATUS_CONFIG[status];
  const { openModal, closeModal } = useModal();

  const handleDeleteClick = () => {
    openModal(
      <div className={styles.modalContent}>
        <p className={styles.modalDescription}>
          Вакансия будет удалена из системы.
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
      { title: "Удалить вакансию?", width: "400px" }
    );
  };

  return (
    <AccordionItem value="details" className={styles.card}>
      <div className={styles.header}>
        <AccordionTrigger className={styles.trigger}>
          <div className={styles.info}>
            <div className={styles.titleRow}>
              <span className={styles.title}>{title}</span>
              <StatusBadge text={badge.text} variant={badge.variant} />
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <MapPin size={16} />
                <span>{location}</span>
              </div>
              <div className={styles.metaItem}>
                <Users size={16} />
                <span>{responsesCount} откликов</span>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        {status === "active" && (
          <Button size="sm" variant="ghost" asChild className={styles.addButton} onClick={onAddResponse}>
            <p>
              <UserPlus size={16} />
              Добавить отклик
            </p>
          </Button>
        )}

        <Menubar>
          <MenubarMenu>
            <MenubarTrigger className={styles.menuTrigger}>
              <MoreVertical size={20} />
            </MenubarTrigger>
            <MenubarContent align="end">
              {status === "active" && (
                <>
                  <MenubarItem onClick={onEdit}>Изменить вакансию</MenubarItem>
                  <MenubarItem variant="destructive" onClick={handleDeleteClick}>
                    Удалить вакансию
                  </MenubarItem>
                </>
              )}
              {status === "inactive" && (
                <MenubarItem onClick={onRestore}>Восстановить вакансию</MenubarItem>
              )}
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <AccordionContent className={styles.content}>
        <div className={styles.list}>
          {responses.map((response) => (
            <div key={response.id} className={styles.item}>
              {response.name}
            </div>
          ))}
          {responses.length === 0 && (
            <div className={styles.empty}>
              Нет откликов
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}