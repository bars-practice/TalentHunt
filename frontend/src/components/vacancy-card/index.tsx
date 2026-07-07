import React from "react";
import { MoreVertical, MapPin, Users, UserPlus } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
import { useModal } from "@/providers/ModalProvider";
import Button from "@/components/ui/button";
import { VacancyStages } from "./VacancyStages";
import { pluralize } from "@/utils/plural";
import styles from "./styles.module.css";

// Описываем структуру объекта вакансии
export interface VacancyProps {
  id: string;
  title: string;
  level: string;
  businessUnit: string;
  location: string;
  responsesCount: number;
  status: "active" | "inactive";
  responses: any[]; // Тип из VacancyStages
}

interface VacancyCardComponentProps {
  vacancy: VacancyProps;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onAddResponse: () => void;
}

const STATUS_CONFIG = {
  active: { text: "АКТИВНА", variant: "success" as const },
  inactive: { text: "УДАЛЕНА", variant: "danger" as const },
};

export function VacancyCard({ vacancy, onEdit, onDelete, onRestore, onAddResponse }: VacancyCardComponentProps) {
  const badge = STATUS_CONFIG[vacancy.status];
  const { openModal, closeModal } = useModal();

  const handleDeleteClick = () => {
    openModal(
      <div className={styles.modalContent}>
        <p className={styles.modalDescription}>Вакансия будет удалена из системы.</p>
        <div className={styles.modalActions}>
          <Button variant="outline" onClick={closeModal}>Отмена</Button>
          <Button variant="danger" onClick={() => { onDelete(); closeModal(); }}>Удалить</Button>
        </div>
      </div>,
      { title: "Удалить вакансию?", width: "400px" }
    );
  };

  return (
    <AccordionItem value={vacancy.id} className={styles.card}>
      <div className={styles.header}>
        <AccordionTrigger className={styles.trigger}>
          <div className={styles.info}>
            <div className={styles.titleRow}>
              <span className={styles.title}>{vacancy.title}</span>
              <StatusBadge text={badge.text} variant={badge.variant} />
            </div>
            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <MapPin size={16} />
                <span>{vacancy.location}</span>
              </div>
              <div className={styles.metaItem}>
                <Users size={16} />
                <span>{vacancy.responsesCount} {pluralize(vacancy.responsesCount, ["отклик", "отклика", "откликов"])}</span>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        {vacancy.status === "active" && (
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
              {vacancy.status === "active" ? (
                <>
                  <MenubarItem onClick={onEdit}>Изменить вакансию</MenubarItem>
                  <MenubarItem variant="destructive" onClick={handleDeleteClick}>Удалить вакансию</MenubarItem>
                </>
              ) : (
                <MenubarItem onClick={onRestore}>Восстановить вакансию</MenubarItem>
              )}
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <AccordionContent className={styles.list}>
        {/* Передаем только то, что нужно компоненту этапов */}
        <VacancyStages responses={vacancy.responses} />
      </AccordionContent>
    </AccordionItem>
  );
}