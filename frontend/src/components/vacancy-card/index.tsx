import { MoreVertical, Users, UserPlus, Building2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
import { useModal } from "@/providers/ModalProvider";
import Button from "@/components/ui/button";
import { VacancyStages } from "./VacancyStages";
import { pluralize } from "@/utils/plural";
import { CandidateSearchModal } from "@/components/candidate-search-modal";
import styles from "./styles.module.css";

export interface VacancyProps {
  id: string;
  title: string;
  level: string;
  businessUnit: string;
  responsesCount: number;
  status: "active" | "inactive";
  responses: any[];
}

interface VacancyCardComponentProps {
  vacancy: VacancyProps;
  responses: any[] | undefined;
  isLoadingResponses: boolean;
  onRefreshResponses: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  isAdmin?: boolean;
  isHR?: boolean;
}

const STATUS_CONFIG = {
  active: { text: "АКТИВНА", variant: "success" as const },
  inactive: { text: "АРХИВ", variant: "neutral" as const },
};

export function VacancyCard({
  vacancy,
  responses,
  onRefreshResponses,
  onEdit,
  onDelete,
  onRestore,
  isAdmin,
  isHR
}: VacancyCardComponentProps) {
  const badge = STATUS_CONFIG[vacancy.status];
  const { openModal, closeModal } = useModal();

  const handleDeleteClick = () => {
    openModal(
      <div className={styles.modalContent}>
        <p className={styles.modalDescription}>Вакансия будет перемещена в архив.</p>
        <div className={styles.modalActions}>
          <Button variant="outline" onClick={closeModal}>Отмена</Button>
          <Button variant="danger" onClick={() => { onDelete(); closeModal(); }}>Подтвердить</Button>
        </div>
      </div>,
      { title: "Закрыть вакансию?", width: "400px" }
    );
  };

  const handleAddCandidate = () => {
    openModal(
      <CandidateSearchModal
        vacancyId={vacancy.id}
        onSuccess={async () => {
          onRefreshResponses();
        }}
      />,
      { title: "Добавить кандидата", width: "600px", showBackButton: false }
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
                <Building2 size={16} />
                <span>{vacancy.businessUnit}</span>
              </div>
              <div className={styles.metaItem}>
                <Users size={16} />
                <span>{vacancy.responsesCount} {pluralize(vacancy.responsesCount, ["отклик", "отклика", "откликов"])}</span>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        {vacancy.status === "active" && isHR && (
          <Button size="sm" variant="ghost" asChild className={styles.addButton} onClick={handleAddCandidate}>
            <p>
              <UserPlus size={16} />
              Добавить отклик
            </p>
          </Button>
        )}

        {vacancy.status === "active" || isAdmin ? (
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
        ) : null}
      </div>

      <AccordionContent className={styles.list}>
        <VacancyStages responses={responses || []} />
      </AccordionContent>
    </AccordionItem>
  );
}