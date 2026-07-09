import { MapPin, MoreVertical, Phone, FileText } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
import { useModal } from "@/providers/ModalProvider";
import Button from "@/components/ui/button";
import { CandidateApplications } from "./CandidateApplications";
import { pluralize } from "@/utils/plural";
import type { Application } from "@/api/applications";
import styles from "./styles.module.css";

export interface CandidateCardData {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  isDeleted: boolean;
}

interface CandidateCardProps {
  candidate: CandidateCardData;
  applications: Application[] | undefined;
  applicationsCount: number;
  isLoadingApplications: boolean;
  canRestore?: boolean;
  onRestore?: () => void;
  canBlock?: boolean;
  onBlock?: () => void;
}

const CANDIDATE_STATUS = {
  active: { text: "АКТИВЕН", variant: "success" as const },
  blocked: { text: "ЗАБЛОКИРОВАН", variant: "danger" as const },
};

export function CandidateCard({
  candidate,
  applications,
  applicationsCount,
  isLoadingApplications,
  canRestore = false,
  onRestore,
  canBlock = false,
  onBlock,
}: CandidateCardProps) {
  const badge = CANDIDATE_STATUS[candidate.isDeleted ? "blocked" : "active"];
  const { openModal, closeModal } = useModal();

  const handleBlockClick = () => {
    openModal(
      <>
        <p className={styles.modalDescription}>
          Кандидат будет скрыт из откликов и списка кандидатов.
          Восстановить его сможет только администратор.
        </p>
        <div className={styles.modalActions}>
          <Button variant="outline" onClick={closeModal}>Отмена</Button>
          <Button
            variant="danger"
            onClick={() => {
              onBlock?.();
              closeModal();
            }}
          >
            Заблокировать
          </Button>
        </div>
      </>,
      { title: "Заблокировать кандидата?", width: "440px" }
    );
  };

  const showMenu = (candidate.isDeleted && canRestore) || (!candidate.isDeleted && canBlock);

  return (
    <AccordionItem value={candidate.id} className={styles.card}>
      <div className={styles.header}>
        <AccordionTrigger className={styles.trigger}>
          <div className={styles.info}>
            <div className={styles.titleRow}>
              <span className={styles.title}>{candidate.fullName}</span>
              <StatusBadge text={badge.text} variant={badge.variant} />
            </div>
            <div className={styles.metaRow}>
              {candidate.city && (
                <div className={styles.metaItem}>
                  <MapPin size={16} />
                  <span>{candidate.city}</span>
                </div>
              )}
              {candidate.phone && (
                <div className={styles.metaItem}>
                  <Phone size={16} />
                  <span>{candidate.phone}</span>
                </div>
              )}
              <div className={styles.metaItem}>
                <FileText size={16} />
                <span>
                  {applicationsCount}{" "}
                  {pluralize(applicationsCount, ["отклик", "отклика", "откликов"])}
                </span>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        {showMenu && (
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger className={styles.menuTrigger}>
                <MoreVertical size={20} />
              </MenubarTrigger>
              <MenubarContent align="end">
                {candidate.isDeleted ? (
                  <MenubarItem onClick={onRestore}>Восстановить кандидата</MenubarItem>
                ) : (
                  <MenubarItem variant="destructive" onClick={handleBlockClick}>
                    Заблокировать кандидата
                  </MenubarItem>
                )}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        )}
      </div>

      <AccordionContent className={styles.list}>
        <CandidateApplications
          applications={applications}
          isLoading={isLoadingApplications}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
