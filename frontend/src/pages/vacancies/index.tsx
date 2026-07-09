import { VacancyCard } from "@/components/vacancy-card";
import { VacancyFormModal } from "@/components/vacancy-form-modal";
import { vacanciesService, type Vacancy, VacancyLevel } from "@/api/vacancies";
import { competenciesService, type Competency } from "@/api/competencies";
import { applicationsService } from "@/api/applications";
import { candidatesService } from "@/api/candidates";
import { GlobalSearch } from "@/components/global-search";
import { searchService, type SearchVacancyItem, type SearchFilters, DEFAULT_SEARCH_FILTERS } from "@/api/search";
import { Permission, canBlockCandidates, isScopedApprover } from "@/utils/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import styles from "./styles.module.css";
import Button from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { useModal } from "@/providers/ModalProvider";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

interface MappedResponse {
  id: string;
  candidateId: string;
  name: string;
  stage: string;
  date: Date | undefined;
  rawStatus: number;
  city: string;
}

const mapStatusToStage = (status: string | number) => {
  if (typeof status === "number") {
    switch (status) {
      case 0: return "new";
      case 1: return "interview";
      case 2: return "decision";
      case 3: return "offer";
      case 4: return "rejected";
      default: return "new";
    }
  }

  const statusLower = String(status).toLowerCase();
  if (statusLower.includes("rejected") || statusLower.includes("отклон")) return "rejected";
  if (statusLower.includes("approved") || statusLower.includes("принят")) return "offer";
  if (statusLower.includes("pending") || statusLower.includes("decision") || statusLower.includes("рассмотрен")) return "decision";
  if (statusLower.includes("inprogress") || statusLower.includes("interview") || statusLower.includes("собеседован")) return "interview";
  return "new";
};

const mapStatusToNumber = (status: string | number): number => {
  if (typeof status === "number") return status;
  const s = String(status).toLowerCase();
  if (s === "inprogress" || s.includes("progress")) return 1;
  if (s === "pendingdecision" || s.includes("pending")) return 2;
  if (s === "approved") return 3;
  if (s === "rejected") return 4;
  return 0;
};

export function Vacancies() {
  const { openModal } = useModal();
  const { hasPermission, user } = usePermissions();
  const canManageVacancies = hasPermission(Permission.CanManageVacancies);
  const canRestoreVacancies = hasPermission(Permission.CanRestoreVacancies);
  const canManageApplications = hasPermission(Permission.CanManageApplications);
  const canBlock = canBlockCandidates(user);
  const [allVacancies, setAllVacancies] = useState<Vacancy[]>([]);
  const vacanciesRef = useRef<Vacancy[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVacancies, setExpandedVacancies] = useState<string[]>([]);
  const [responsesCache, setResponsesCache] = useState<Record<string, MappedResponse[]>>({});
  const [loadingResponses, setLoadingResponses] = useState<Record<string, boolean>>({});
  const [fetchedVacancyIds, setFetchedVacancyIds] = useState<string[]>([]);
  const [rawSearchResults, setRawSearchResults] = useState<SearchVacancyItem[] | null>(null);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const currentQueryRef = useRef("");

  const loadVacancies = async () => {
    try {
      const data = await vacanciesService.getAll();
      setError(null);
      setAllVacancies(data);
      vacanciesRef.current = data;
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadVacancies();
    void loadCompetencies();
  }, []);

  const reloadVacancies = async () => {
    setLoading(true);
    await loadVacancies();
  };

  const loadResponsesForVacancy = async (vacancyId: string) => {
    try {
      setLoadingResponses(prev => ({ ...prev, [vacancyId]: true }));
      const allApplications = await applicationsService.getAll();
      const vacancyApplications = allApplications.filter(app => app.vacancyId === vacancyId && !app.isDeleted);

      const mapped: MappedResponse[] = vacancyApplications.map(app => ({
        id: app.id,
        candidateId: app.candidateId,
        name: app.candidateFullName,
        stage: mapStatusToStage(app.status),
        date: app.interviewScheduledAt ? new Date(app.interviewScheduledAt) : undefined,
        rawStatus: mapStatusToNumber(app.status),
        city: "",
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

    if (rawSearchResults !== null) return;

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

  const sortedVacancies = useMemo(() => {
    let vacancies: Vacancy[];

    if (rawSearchResults !== null) {
      vacancies = rawSearchResults.map(item => ({
        id: item.vacancyId,
        title: item.vacancyTitle,
        level: item.level as VacancyLevel,
        businessUnit: item.businessUnit,
        description: "",
        approverId: "",
        competencies: [],
        isDeleted: item.isDeleted,
        applicationsCount: item.applications.length,
      }));
    } else {
      vacancies = [...allVacancies];
    }

    if (activeFilters.vacancyStatus === "active") {
      vacancies = vacancies.filter(v => !v.isDeleted);
    } else if (activeFilters.vacancyStatus === "archived") {
      vacancies = vacancies.filter(v => v.isDeleted);
    }

    if (activeFilters.vacancyLevels.length > 0) {
      vacancies = vacancies.filter(v => activeFilters.vacancyLevels.includes(v.level));
    }

    return vacancies.sort((a, b) => {
      if (a.isDeleted === b.isDeleted) return 0;
      return a.isDeleted ? 1 : -1;
    });
  }, [rawSearchResults, allVacancies, activeFilters]);

  const getResponsesForVacancy = useCallback((vacancyId: string): MappedResponse[] | undefined => {
    if (rawSearchResults !== null) {
      const item = rawSearchResults.find(i => i.vacancyId === vacancyId);
      if (!item) return [];
      return item.applications.map(a => ({
        id: a.applicationId,
        candidateId: a.candidateId,
        name: a.candidateFullName,
        stage: mapStatusToStage(a.status),
        date: a.interviewScheduledAt ? new Date(a.interviewScheduledAt) : undefined,
        rawStatus: a.status,
        city: a.city,
      }));
    }

    return responsesCache[vacancyId];
  }, [rawSearchResults, responsesCache]);

  const handleAddVacancy = () => {
    openModal(
      <VacancyFormModal
        competencies={competencies}
        defaultApprover={
          user && isScopedApprover(user)
            ? { id: user.id, fullName: user.fullName }
            : undefined
        }
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
              approverId: data.approverId,
              competencyIds: data.competencyIds
            });
            await reloadVacancies();
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
          approverId: vacancy.approverId,
          competencyIds: vacancy.competencies?.map((c) => c.id) || [],
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
              approverId: data.approverId,
              competencyIds: data.competencyIds
            });
            await reloadVacancies();
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
      await reloadVacancies();
    } catch (err) {
      console.error("Failed to delete vacancy:", err);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await vacanciesService.update(id, { isDeleted: false });
      await reloadVacancies();
    } catch (err) {
      console.error("Failed to restore vacancy:", err);
    }
  };

  const handleBlockCandidate = async (candidateId: string) => {
    try {
      await candidatesService.block(candidateId);
      setResponsesCache(prev => {
        const next = { ...prev };
        for (const vacancyId of Object.keys(next)) {
          next[vacancyId] = next[vacancyId].filter(r => r.candidateId !== candidateId);
        }
        return next;
      });
      if (rawSearchResults !== null) {
        setRawSearchResults(prev =>
          prev?.map(item => ({
            ...item,
            applications: item.applications.filter(a => a.candidateId !== candidateId),
          })) ?? null
        );
      }
      await reloadVacancies();
    } catch (err) {
      console.error("Failed to block candidate:", err);
    }
  };

  const runSearch = useCallback(async (query: string, filters: SearchFilters) => {
    const hasQuery = query.trim().length > 0;
    const hasFilters =
      filters.vacancyStatus !== "all" ||
      filters.vacancyLevels.length > 0 ||
      filters.candidateStatuses.length > 0 ||
      filters.city.trim().length > 0;

    if (!hasQuery && !hasFilters) {
      setRawSearchResults(null);
      return;
    }

    try {
      const results = await searchService.search(query, filters);
      setRawSearchResults(results.items);
    } catch (err) {
      console.error("Search failed:", err);
      setRawSearchResults(null);
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    currentQueryRef.current = query;
    await runSearch(query, activeFilters);
  }, [activeFilters, runSearch]);

  const handleFiltersChange = useCallback(async (filters: SearchFilters) => {
    setActiveFilters(filters);
    await runSearch(currentQueryRef.current, filters);
  }, [runSearch]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление вакансиями</h1>
        {canManageVacancies && (
          <Button
            size="lg"
            variant="primary"
            className={styles.addButton}
            onClick={handleAddVacancy}
          >
            <Briefcase size={20} />
            Добавить вакансию
          </Button>
        )}
      </div>
      <div className={styles.searchSection}>
        <GlobalSearch
          onSearch={handleSearch}
          onFiltersChange={handleFiltersChange}
          filters={activeFilters}
          placeholder="Поиск по вакансиям и кандидатам..."
        />
      </div>
      {loading ? (
        <div className={styles.vacanciesList}>Загрузка...</div>
      ) : error ? (
        <div className={styles.vacanciesList}>Ошибка: {error}</div>
      ) : rawSearchResults !== null && sortedVacancies.length === 0 ? (
        <div className={styles.emptySearch}>По вашему запросу ничего не найдено</div>
      ) : (
        <Accordion
          type="multiple"
          className={styles.vacanciesList}
          value={expandedVacancies}
          onValueChange={handleAccordionChange}
        >
          {sortedVacancies.map((vacancy) => {
            const levelLabel = vacancy.level === VacancyLevel.Junior ? "Junior" : vacancy.level === VacancyLevel.Middle ? "Middle" : "Senior";
            const responses = getResponsesForVacancy(vacancy.id);
            const responsesCount = responses !== undefined
              ? responses.length
              : vacancy.applicationsCount;
            return (
              <VacancyCard
                key={vacancy.id}
                vacancy={{
                  id: vacancy.id,
                  title: vacancy.title,
                  level: levelLabel,
                  businessUnit: vacancy.businessUnit,
                  responsesCount,
                  status: vacancy.isDeleted ? "inactive" : "active",
                  responses: [],
                }}
                responses={responses}
                isLoadingResponses={rawSearchResults !== null ? false : (loadingResponses[vacancy.id] || false)}
                onRefreshResponses={() => loadResponsesForVacancy(vacancy.id)}
                onEdit={() => handleEdit(vacancy)}
                onDelete={() => handleDelete(vacancy.id)}
                onRestore={() => handleRestore(vacancy.id)}
                canManageVacancies={canManageVacancies}
                canRestoreVacancies={canRestoreVacancies}
                canManageApplications={canManageApplications}
                canBlockCandidates={canBlock}
                onBlockCandidate={canBlock ? handleBlockCandidate : undefined}
              />
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
