import { CandidateCard } from "@/components/candidate-card";
import { CandidateCreateForm } from "@/components/candidate-create-form";
import { GlobalSearch } from "@/components/global-search";
import { candidatesService } from "@/api/candidates";
import { applicationsService, type Application } from "@/api/applications";
import { Permission, canBlockCandidates } from "@/utils/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { useModal } from "@/providers/ModalProvider";
import Button from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { UserPlus } from "lucide-react";
import styles from "./styles.module.css";
import { useCallback, useEffect, useMemo, useState } from "react";

export function Candidates() {
  const { openModal, closeModal } = useModal();
  const { hasPermission, user } = usePermissions();
  const canManageCandidates = hasPermission(Permission.CanManageCandidates);
  const canRestoreCandidates = hasPermission(Permission.CanRestoreCandidates);
  const canBlock = canBlockCandidates(user);
  const canViewApplications = hasPermission(Permission.CanViewApplications);

  const [candidates, setCandidates] = useState<Awaited<ReturnType<typeof candidatesService.getAll>>>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCandidates, setExpandedCandidates] = useState<string[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationsLoaded, setApplicationsLoaded] = useState(false);
  const [searchIds, setSearchIds] = useState<string[] | null>(null);
  const [searchResults, setSearchResults] = useState<Awaited<ReturnType<typeof candidatesService.search>>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await candidatesService.getAll();
      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить кандидатов");
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = useCallback(async () => {
    if (!canViewApplications || applicationsLoaded) return;

    try {
      setLoadingApplications(true);
      const data = await applicationsService.getAll();
      setAllApplications(data.filter(app => !app.isDeleted));
      setApplicationsLoaded(true);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoadingApplications(false);
    }
  }, [applicationsLoaded, canViewApplications]);

  useEffect(() => {
    void loadCandidates();
    void loadApplications();
  }, [loadApplications]);

  const handleSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchIds(null);
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await candidatesService.search(trimmed);
      setSearchResults(results);
      setSearchIds(results.map(r => r.id));
    } catch (err) {
      console.error("Candidate search failed:", err);
      setSearchResults([]);
      setSearchIds([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const applicationsByCandidate = useMemo(() => {
    const map: Record<string, Application[]> = {};
    for (const app of allApplications) {
      if (!map[app.candidateId]) map[app.candidateId] = [];
      map[app.candidateId].push(app);
    }
    return map;
  }, [allApplications]);

  const sortedCandidates = useMemo(() => [...candidates].sort((a, b) => {
    if (!!a.isDeleted === !!b.isDeleted) {
      return a.fullName.localeCompare(b.fullName, "ru");
    }
    return a.isDeleted ? 1 : -1;
  }), [candidates]);

  const displayedCandidates = useMemo(() => {
    if (searchIds === null) return sortedCandidates;

    const byId = new Map(sortedCandidates.map(c => [c.id, c]));
    return searchIds.map(id => {
      const existing = byId.get(id);
      if (existing) return existing;

      const fromSearch = searchResults.find(r => r.id === id);
      if (!fromSearch) return null;

      return {
        id: fromSearch.id,
        fullName: fromSearch.fullName,
        phone: "",
        city: fromSearch.city,
        skills: "",
        education: "",
        experience: "",
        placesOfWork: [],
        isDeleted: fromSearch.isDeleted,
      };
    }).filter((c): c is NonNullable<typeof c> => c !== null);
  }, [sortedCandidates, searchIds, searchResults]);

  const handleRestore = async (candidateId: string) => {
    try {
      await candidatesService.restore(candidateId);
      await loadCandidates();
    } catch (err) {
      console.error("Failed to restore candidate:", err);
    }
  };

  const handleBlock = async (candidateId: string) => {
    try {
      await candidatesService.block(candidateId);
      await loadCandidates();
    } catch (err) {
      console.error("Failed to block candidate:", err);
    }
  };

  const isSearchActive = searchIds !== null;

  const handleAddCandidate = () => {
    openModal(
      <CandidateCreateForm
        onCancel={closeModal}
        onSuccess={async () => {
          await loadCandidates();
          closeModal();
        }}
      />,
      { title: "Добавить кандидата", width: "600px" }
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Реестр кандидатов</h1>
        {canManageCandidates && (
          <Button size="lg" variant="primary" className={styles.addButton} onClick={handleAddCandidate}>
            <UserPlus size={20} />
            Добавить кандидата
          </Button>
        )}
      </div>

      <div className={styles.searchSection}>
        <GlobalSearch
          onSearch={handleSearch}
          showFilters={false}
          placeholder="Поиск по кандидатам..."
        />
      </div>

      {loading ? (
        <div className={styles.candidatesList}>Загрузка...</div>
      ) : error ? (
        <div className={styles.candidatesList}>Ошибка: {error}</div>
      ) : isSearchActive && isSearching ? (
        <div className={styles.candidatesList}>Поиск...</div>
      ) : isSearchActive && displayedCandidates.length === 0 ? (
        <div className={styles.emptySearch}>По вашему запросу ничего не найдено</div>
      ) : displayedCandidates.length === 0 ? (
        <div className={styles.empty}>Кандидаты не найдены</div>
      ) : (
        <Accordion
          type="multiple"
          className={styles.candidatesList}
          value={expandedCandidates}
          onValueChange={setExpandedCandidates}
        >
          {displayedCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={{
                id: candidate.id,
                fullName: candidate.fullName,
                phone: candidate.phone,
                city: candidate.city,
                isDeleted: !!candidate.isDeleted,
              }}
              applications={applicationsLoaded ? (applicationsByCandidate[candidate.id] ?? []) : undefined}
              applicationsCount={applicationsByCandidate[candidate.id]?.length ?? 0}
              isLoadingApplications={expandedCandidates.includes(candidate.id) && !applicationsLoaded && loadingApplications}
              canRestore={canRestoreCandidates}
              onRestore={() => handleRestore(candidate.id)}
              canBlock={canBlock && !candidate.isDeleted}
              onBlock={() => handleBlock(candidate.id)}
            />
          ))}
        </Accordion>
      )}
    </div>
  );
}
