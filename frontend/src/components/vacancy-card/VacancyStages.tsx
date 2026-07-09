import { Calendar, MoreHorizontal } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
import { Link } from "react-router-dom";
import { useModal } from "@/providers/ModalProvider";
import Button from "@/components/ui/button";
import styles from "./styles.module.css";

type ResponseStage = "new" | "interview" | "decision" | "offer" | "rejected";

interface CandidateResponse {
  id: string;
  candidateId: string;
  name: string;
  stage: ResponseStage;
  date?: Date;
}

const STAGES: { id: ResponseStage; title: string }[] = [
  { id: "new", title: "Новые" },
  { id: "interview", title: "Ожидают собеседования" },
  { id: "decision", title: "Ожидают решения" },
  { id: "offer", title: "Принят" },
  { id: "rejected", title: "Отклонен" },
];

function formatDate(d: Date) {
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(-2)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ResponseItem({
  response,
  canManageApplications,
  onBlockCandidate,
}: {
  response: CandidateResponse;
  canManageApplications: boolean;
  onBlockCandidate?: (candidateId: string) => void;
}) {
  const { openModal, closeModal } = useModal();

  const handleBlockClick = () => {
    openModal(
      <div className={styles.modalContent}>
        <p className={styles.modalDescription}>
          Кандидат будет скрыт из откликов и списка кандидатов.
          Восстановить его сможет только администратор.
        </p>
        <div className={styles.modalActions}>
          <Button variant="outline" onClick={closeModal}>Отмена</Button>
          <Button
            variant="danger"
            onClick={() => {
              onBlockCandidate?.(response.candidateId);
              closeModal();
            }}
          >
            Заблокировать
          </Button>
        </div>
      </div>,
      { title: "Заблокировать кандидата?", width: "440px" }
    );
  };

  return (
    <div className={styles.item}>
      <div className={styles.itemInfo}>
        <Link to={`/assessment/${response.id}`} className={styles.itemName}>
          {response.name}
        </Link>
        {response.date && (
          <div className={styles.itemDate}>
            <Calendar size={14} />
            <span>{formatDate(response.date)}</span>
          </div>
        )}
      </div>
      {canManageApplications && onBlockCandidate && (
        <Menubar className={styles.itemMenu}>
          <MenubarMenu>
            <MenubarTrigger className={styles.itemMenuTrigger}>
              <MoreHorizontal size={16} />
            </MenubarTrigger>
            <MenubarContent align="end">
              <MenubarItem variant="destructive" onClick={handleBlockClick}>
                Заблокировать кандидата
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )}
    </div>
  );
}

function sortByInterviewDate(responses: CandidateResponse[]) {
  return [...responses].sort((a, b) => {
    const aTime = a.date?.getTime() ?? Number.POSITIVE_INFINITY;
    const bTime = b.date?.getTime() ?? Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });
}

export function VacancyStages({
  responses,
  canManageApplications = false,
  onBlockCandidate,
}: {
  responses: CandidateResponse[];
  canManageApplications?: boolean;
  onBlockCandidate?: (candidateId: string) => void;
}) {
  return (
    <Accordion type="multiple" className={styles.stagesAccordion}>
      {STAGES.map((stage) => {
        const stageResponses = sortByInterviewDate(responses.filter((r) => r.stage === stage.id));

        return (
          <AccordionItem key={stage.id} value={stage.id} className={styles.stageItem}>
            <AccordionTrigger className={styles.stageTrigger}>
              <div>
                <span>{stage.title} </span>
                <span className={styles.stageCount}>({stageResponses.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className={styles.stageContent}>
              {stageResponses.map((response) => (
                <ResponseItem
                  key={response.id}
                  response={response}
                  canManageApplications={canManageApplications}
                  onBlockCandidate={onBlockCandidate}
                />
              ))}
              {stageResponses.length === 0 && (
                <div className={styles.empty}>Нет кандидатов на этом этапе</div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
