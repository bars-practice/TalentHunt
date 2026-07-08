import { CandidateInfo } from "./CandidateInfo";
import { CompetencyMatrix } from "./CompetencyMatrix";
import Button from "@/components/ui/button";
import styles from "./styles.module.css";

interface Competency {
  id: string;
  name: string;
  description: string;
  assessment?: string;
  comment?: string;
}

export function CompetencyAssessment() {
  const candidateData = {
    name: "Иванов Кабан Кабаныч, 22",
    role: "Full-stack Developer (.NET / React)",
    location: "г. Казань",
    phone: "+7 (999) 123-45-67",
    education: "Казанский федеральный университет",
    experience: ["IT-Solutions", "Sber"],
    totalExperience: "Опыт работы: 5 лет",
    status: "ОЖИДАЕТ СОБЕСЕДОВАНИЯ",
    interviewDate: "25.06.26 15:00",
  };

  const competencies: Competency[] = [
    {
      id: "1",
      name: "React & State Management",
      description: "Знание React, hooks, Redux или других state management решений",
    },
    {
      id: "2",
      name: "TypeScript & Architecture",
      description: "Опыт работы с TypeScript, понимание архитектурных паттернов",
    },
    {
      id: "3",
      name: "Коммуникабельность",
      description: "Умение четко излагать мысли, работать в команде",
    },
    {
      id: "4",
      name: "Решение проблем",
      description: "Аналитическое мышление, способность находить решения",
    },
  ];

  const handleStartInterview = () => {
    console.log("Starting interview");
  };

  const handleEditDate = () => {
    console.log("Editing interview date");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Оценка компетенций</h1>
        <Button 
          size="lg" 
          variant="primary" 
          className={styles.startButton}
          onClick={handleStartInterview}
        >
          Начать собеседование
        </Button>
      </div>
      
      <CandidateInfo
        {...candidateData}
        onEditDate={handleEditDate}
      />
      
      <CompetencyMatrix
        competencies={competencies}
      />
    </div>
  );
}
