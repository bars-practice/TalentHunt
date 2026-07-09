import { MapPin, MoreVertical, Phone, FileText } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
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
}: CandidateCardProps) {
  const badge = CANDIDATE_STATUS[candidate.isDeleted ? "blocked" : "active"];

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

        {candidate.isDeleted && canRestore && (
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger className={styles.menuTrigger}>
                <MoreVertical size={20} />
              </MenubarTrigger>
              <MenubarContent align="end">
                <MenubarItem onClick={onRestore}>Восстановить кандидата</MenubarItem>
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
