import { VacancyCard } from "@/components/vacancy-card";
import { VacancyFormModal } from "@/components/vacancy-form-modal";
import { vacanciesService, type Vacancy, VacancyLevel } from "@/api/vacancies";
import { competenciesService, type Competency } from "@/api/competencies";
import { Role } from "@/api/auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import styles from "./styles.module.css";
import Button from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { Accordion } from "@radix-ui/react-accordion";
import { useModal } from "@/providers/ModalProvider";
import { useState, useEffect } from "react";

export function Vacancies() {
  const { openModal } = useModal();
  const { user } = useCurrentUser();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const sortedVacancies = [...vacancies].sort((a, b) => {
    if (a.isDeleted === b.isDeleted) return 0;
    return a.isDeleted ? 1 : -1;
  });
  const isAdmin = user?.role === Role.Admin;

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
              level: data.level,
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

  const handleAddResponse = (id: string) => {
    console.log("Add response:", id);
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
        <Accordion type="multiple" className={styles.vacanciesList}>
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
                onEdit={() => handleEdit(vacancy)}
                onDelete={() => handleDelete(vacancy.id)}
                onRestore={() => handleRestore(vacancy.id)}
                onAddResponse={() => handleAddResponse(vacancy.id)}
                isAdmin={isAdmin}
              />
            );
          })}
        </Accordion>
      )}
    </div>
  );
}