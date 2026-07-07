import { VacancyCard } from "@/components/vacancy-card";
import { VacancyFormModal } from "@/components/vacancy-form-modal";
import { vacanciesService, type Vacancy, VacancyLevel } from "@/api/vacancies";
import { competenciesService, type Competency } from "@/api/competencies";
import { applicationsService } from "@/api/applications";
import { Role } from "@/api/auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import styles from "./styles.module.css";
import Button from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { useModal } from "@/providers/ModalProvider";
import { useState, useEffect } from "react";

const mapStatusToStage = (status: string | number) => {
  if (typeof status === "number") {
    switch (status) {
      case 0: return "new";
      case 1: return "interview";
      case 2: return "decision";
      case 3: return "offer";
      default: return "new";
    }
  }

  const statusLower = String(status).toLowerCase();
  if (statusLower.includes("interview")) return "interview";
  if (statusLower.includes("decision") || statusLower.includes("approved") || statusLower.includes("rejected")) return "decision";
  if (statusLower.includes("offer")) return "offer";
  return "new";
};;

export function Vacancies() {
  const { openModal } = useModal();
  const { user } = useCurrentUser();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVacancies, setExpandedVacancies] = useState<string[]>([]);
  const [responsesCache, setResponsesCache] = useState<Record<string, any[]>>({});
  const [loadingResponses, setLoadingResponses] = useState<Record<string, boolean>>({});
  const [fetchedVacancyIds, setFetchedVacancyIds] = useState<string[]>([]);

  const loadVacancies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vacanciesService.getAll();
      setVacancies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vacancies");
    } finally {
      setLoading(false);
    }
  };

  const loadCompetencies = async () => {
    try {
      const data = await competenciesService.getAll();
      setCompetencies(data);
    } catch (err) {
      console.error("Failed to load competencies:", err);
    }
  };

  useEffect(() => {
    loadVacancies();
    loadCompetencies();
  }, []);

  const loadResponsesForVacancy = async (vacancyId: string) => {
    try {
      setLoadingResponses(prev => ({ ...prev, [vacancyId]: true }));
      const allApplications = await applicationsService.getAll();
      const vacancyApplications = allApplications.filter(app => app.vacancyId === vacancyId && !app.isDeleted);

      const mapped = vacancyApplications.map(app => ({
        id: app.id,
        name: app.candidateFullName,
        stage: mapStatusToStage(app.status),
        date: app.decidedAt ? new Date(app.decidedAt) : undefined,
      }));

      setResponsesCache(prev => ({ ...prev, [vacancyId]: mapped }));
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoadingResponses(prev => ({ ...prev, [vacancyId]: false }));
    }
  };

  const handleAccordionChange = (values: string[]) => {
    setExpandedVacancies(values);

    const toFetch = values.filter(id => !fetchedVacancyIds.includes(id));

    if (toFetch.length > 0) {
      setFetchedVacancyIds(prev => [...prev, ...toFetch]);

      setTimeout(() => {
        toFetch.forEach(id => {
          loadResponsesForVacancy(id);
        });
      }, 250);
    }
  };

  const sortedVacancies = [...vacancies].sort((a, b) => {
    if (a.isDeleted === b.isDeleted) return 0;
    return a.isDeleted ? 1 : -1;
  });
  const isAdmin = user?.role === Role.Admin;
  const isHR = user?.role === Role.HR;

  const handleAddVacancy = () => {
    openModal(
      <VacancyFormModal
        competencies={competencies}
        onAddNewCompetency={async (name) => {
          const newCompetency = await competenciesService.create({ name, description: "" });
          setCompetencies([...competencies, newCompetency]);
          return newCompetency.id;
        }}
        onSubmit={async (data) => {
          try {
            await vacanciesService.create({
              title: data.title,
              level: data.level!,
              businessUnit: data.businessUnit,
              description: data.description || "",
              competencyIds: data.competencyIds
            });
            await loadVacancies();
          } catch (err) {
            console.error("Failed to create vacancy:", err);
          }
        }}
      />,
      { title: "Добавить вакансию", width: "600px" }
    );
  };

  const handleEdit = (vacancy: Vacancy) => {
    openModal(
      <VacancyFormModal
        initialData={{
          title: vacancy.title,
          level: vacancy.level,
          businessUnit: vacancy.businessUnit,
          description: vacancy.description,
        }}
        competencies={competencies}
        onAddNewCompetency={async (name) => {
          const newCompetency = await competenciesService.create({ name, description: "" });
          setCompetencies([...competencies, newCompetency]);
          return newCompetency.id;
        }}
        onSubmit={async (data) => {
          try {
            await vacanciesService.update(vacancy.id, {
              title: data.title,
              level: data.level,
              businessUnit: data.businessUnit,
              description: data.description || "",
              competencyIds: data.competencyIds
            });
            await loadVacancies();
          } catch (err) {
            console.error("Failed to update vacancy:", err);
          }
        }}
      />,
      { title: "Изменить вакансию", width: "600px" }
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await vacanciesService.update(id, { isDeleted: true });
      await loadVacancies();
    } catch (err) {
      console.error("Failed to delete vacancy:", err);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await vacanciesService.update(id, { isDeleted: false });
      await loadVacancies();
    } catch (err) {
      console.error("Failed to restore vacancy:", err);
    }
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
      {loading ? (
        <div className={styles.vacanciesList}>Загрузка...</div>
      ) : error ? (
        <div className={styles.vacanciesList}>Ошибка: {error}</div>
      ) : (
        <Accordion
          type="multiple"
          className={styles.vacanciesList}
          value={expandedVacancies}
          onValueChange={handleAccordionChange}
        >
          {sortedVacancies.map((vacancy) => {
            const levelLabel = vacancy.level === VacancyLevel.Junior ? "Junior" : vacancy.level === VacancyLevel.Middle ? "Middle" : "Senior";
            return (
              <VacancyCard
                key={vacancy.id}
                vacancy={{
                  id: vacancy.id,
                  title: vacancy.title,
                  level: levelLabel,
                  businessUnit: vacancy.businessUnit,
                  responsesCount: 0,
                  status: vacancy.isDeleted ? "inactive" : "active",
                  responses: [],
                }}
                responses={responsesCache[vacancy.id]}
                isLoadingResponses={loadingResponses[vacancy.id] || false}
                onRefreshResponses={() => loadResponsesForVacancy(vacancy.id)}
                onEdit={() => handleEdit(vacancy)}
                onDelete={() => handleDelete(vacancy.id)}
                onRestore={() => handleRestore(vacancy.id)}
                isAdmin={isAdmin}
                isHR={isHR}
              />
            );
          })}
        </Accordion>
      )}
    </div>
  );
}