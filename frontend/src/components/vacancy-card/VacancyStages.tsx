import { Calendar, MoreHorizontal } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
import styles from "./styles.module.css";

type ResponseStage = "new" | "interview" | "decision" | "offer";

interface CandidateResponse {
  id: string;
  name: string;
  stage: ResponseStage;
  date?: Date;
}

const STAGES: { id: ResponseStage; title: string }[] = [
  { id: "new", title: "Новые" },
  { id: "interview", title: "Ожидают собеседования" },
  { id: "decision", title: "Ожидают решения" },
  { id: "offer", title: "Оффер" },
];

function formatDate(d: Date) {
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(-2)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ResponseItem({ response }: { response: CandidateResponse }) {
  return (
    <div className={styles.item}>
      <div className={styles.itemInfo}>
        <span className={styles.itemName}>{response.name}</span>
        {response.date && (
          <div className={styles.itemDate}>
            <Calendar size={14} />
            <span>{formatDate(response.date)}</span>
          </div>
        )}
      </div>
      <Menubar className={styles.itemMenu}>
        <MenubarMenu>
          <MenubarTrigger className={styles.itemMenuTrigger}>
            <MoreHorizontal size={16} />
          </MenubarTrigger>
          <MenubarContent align="end">
            <MenubarItem variant="destructive">Заблокировать кандидата</MenubarItem>
            <MenubarItem variant="destructive">Удалить отклик</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}

export function VacancyStages({ responses }: { responses: CandidateResponse[] }) {
  return (
    <Accordion type="multiple" className={styles.stagesAccordion}>
      {STAGES.map((stage) => {
        const stageResponses = responses.filter((r) => r.stage === stage.id);

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
                <ResponseItem key={response.id} response={response} />
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