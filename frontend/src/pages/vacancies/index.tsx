import { VacancyCard } from "@/components/vacancy-card";
import { VacancyFormModal } from "@/components/vacancy-form-modal";
import { VACANCY_LEVEL } from "@/shared/types/vacancy";
import styles from "./styles.module.css";
import Button from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { Accordion } from "@radix-ui/react-accordion";
import { useModal } from "@/providers/ModalProvider";

// Mock competencies data
const mockCompetencies = [
  { id: "c1", name: "React" },
  { id: "c2", name: "TypeScript" },
  { id: "c3", name: "Node.js" },
  { id: "c4", name: "Python" },
  { id: "c5", name: "SQL" },
  { id: "c6", name: "Docker" },
  { id: "c7", name: "AWS" },
  { id: "c8", name: "Kubernetes" },
  { id: "c9", name: "GraphQL" },
  { id: "c10", name: "REST API" },
];

// !!! Mock Data
const mockVacancies = [
  {
    id: "v1",
    title: "Senior Product Designer",
    level: VACANCY_LEVEL.Senior,
    businessUnit: "Product",
    responsesCount: 4,
    status: "active" as const,
    responses: [
      {
        id: "r1",
        name: "Ивaан Кабаныч",
        stage: "new" as const,
        date: new Date("2026-06-25T19:00:00")
      },
      {
        id: "r5",
        name: "Иванов Кабан Кабаныч",
        stage: "new" as const,
        date: new Date("2026-06-25T15:00:00")
      },
      {
        id: "r2",
        name: "Екатерина Петрова",
        stage: "interview" as const,
        date: new Date("2026-06-24T11:30:00")
      },
      {
        id: "r3",
        name: "Дмитрий Иванов",
        stage: "decision" as const,
        date: new Date("2026-06-23T18:15:00")
      },
      {
        id: "r4",
        name: "Анна Сидорова",
        stage: "offer" as const,
        date: new Date("2026-06-22T12:00:00")
      },
    ].sort((a, b) => b.date.getTime() - a.date.getTime())
  },
  {
    id: "v2",
    title: "Middle Frontend Developer",
    level: VACANCY_LEVEL.Middle,
    businessUnit: "Engineering",
    responsesCount: 2,
    status: "active" as const,
    responses: [
      { id: "r5", name: "Иван Семенов", stage: "new" as const, date: new Date("2026-06-25T09:45:00") },
      { id: "r6", name: "Михаил Федоров", stage: "interview" as const, date: new Date("2026-06-21T14:20:00") },
    ].sort((a, b) => b.date.getTime() - a.date.getTime())
  },
  {
    id: "v3",
    title: "Junior Data Analyst",
    level: VACANCY_LEVEL.Junior,
    businessUnit: "Analytics",
    responsesCount: 0,
    status: "active" as const,
    responses: []
  },
  {
    id: "v4",
    title: "Senior Backend Developer",
    level: VACANCY_LEVEL.Senior,
    businessUnit: "Engineering",
    responsesCount: 0,
    status: "inactive" as const,
    responses: []
  },
];

export function Vacancies() {
  const { openModal } = useModal();

  const sortedVacancies = [...mockVacancies].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "inactive" ? 1 : -1;
  });

  const handleAddVacancy = () => {
    openModal(
      <VacancyFormModal
        competencies={mockCompetencies}
        onAddNewCompetency={(name) => {
          const newId = `c${Date.now()}`;
          console.log("Add new competency:", name, "with id:", newId);
          return newId;
        }}
        onSubmit={(data) => {
          console.log("Vacancy data:", data);
        }}
      />,
      { title: "Добавить вакансию", width: "600px" }
    );
  };

  const handleEdit = (index: number) => {
    const vacancy = mockVacancies[index];
    openModal(
      <VacancyFormModal
        initialData={{
          title: vacancy.title,
          level: vacancy.level,
          businessUnit: vacancy.businessUnit,
        }}
        competencies={mockCompetencies}
        onAddNewCompetency={(name) => {
          const newId = `c${Date.now()}`;
          console.log("Add new competency:", name, "with id:", newId);
          return newId;
        }}
        onSubmit={(data) => {
          console.log("Edit vacancy data:", data);
        }}
      />,
      { title: "Изменить вакансию", width: "600px" }
    );
  };

  const handleDelete = (index: number) => {
    console.log("Delete vacancy:", index);
  };

  const handleRestore = (index: number) => {
    console.log("Restore vacancy:", index);
  };

  const handleAddResponse = (index: number) => {
    console.log("Add response:", index);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление вакансиями</h1>
        <Button size="lg" variant="primary" className={styles.addButton} onClick={handleAddVacancy}>
          <Briefcase size={20} />
          Добавить вакансию
        </Button>
      </div>
      <Accordion type="multiple" className={styles.vacanciesList}>
        {sortedVacancies.map((vacancy, index) => (
          <VacancyCard
            key={index}
            vacancy={vacancy}
            onEdit={() => handleEdit(index)}
            onDelete={() => handleDelete(index)}
            onRestore={() => handleRestore(index)}
            onAddResponse={() => handleAddResponse(index)}
          />
        ))}
      </Accordion>
    </div>
  );
}