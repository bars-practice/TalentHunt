import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CandidateInfo } from "./CandidateInfo";
import { CompetencyMatrix } from "./CompetencyMatrix";
import Button from "@/components/ui/button";
import { applicationsService } from "@/api/applications";
import { candidatesService } from "@/api/candidates";
import { vacanciesService } from "@/api/vacancies";
import styles from "./styles.module.css";

interface Competency {
  id: string;
  name: string;
  description: string;
  assessment?: number;
  comment?: string;
}

export function CompetencyAssessment() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [candidateData, setCandidateData] = useState<any>(null);
  const [competencies, setCompetencies] = useState<Competency[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!id) return;

      try {
        setLoading(true);
        const application = await applicationsService.getById(id);
        const candidate = await candidatesService.getAll();
        const candidateInfo = candidate.find(c => c.id === application.candidateId);

        const vacancy = await vacanciesService.getAll();
        const vacancyInfo = vacancy.find(v => v.id === application.vacancyId);

        if (candidateInfo && vacancyInfo) {
          setCandidateData({
            name: candidateInfo.fullName,
            role: vacancyInfo.title,
            location: candidateInfo.city,
            phone: candidateInfo.phone,
            education: candidateInfo.education,
            experience: candidateInfo.placesOfWork || [],
            totalExperience: candidateInfo.experience,
            status: 0,
            interviewDate: "Не назначено",
          });

          setCompetencies(vacancyInfo.competencies.map((comp, index) => ({
            id: comp.id,
            name: comp.name,
            description: "",
            assessment: [1, 2, 3, 4, 5][index % 2],
          })));
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleStartInterview = () => {
    console.log("Starting interview");
  };

  const handleDateSave = (date: string) => {
    setCandidateData((prev: any) => ({
      ...prev,
      interviewDate: date
    }));
  };

  if (loading) {
    return <div className={styles.container}>Загрузка...</div>;
  }

  if (!candidateData) {
    return <div className={styles.container}>Данные не найдены</div>;
  }

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
        onDateSave={handleDateSave}
      />

      <CompetencyMatrix
        competencies={competencies}
      />
    </div>
  );
}
