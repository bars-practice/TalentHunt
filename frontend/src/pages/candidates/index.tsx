import { CandidateCard } from "@/components/candidate-card";
import { candidatesService } from "@/api/candidates";
import { applicationsService, type Application } from "@/api/applications";
import { Permission } from "@/utils/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { Accordion } from "@/components/ui/accordion";
import styles from "./styles.module.css";
import { useCallback, useEffect, useMemo, useState } from "react";

export function Candidates() {
  const { hasPermission } = usePermissions();
  const canRestoreCandidates = hasPermission(Permission.CanManageUsers);
  const canViewApplications = hasPermission(Permission.CanViewApplications);

  const [candidates, setCandidates] = useState<Awaited<ReturnType<typeof candidatesService.getAll>>>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCandidates, setExpandedCandidates] = useState<string[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationsLoaded, setApplicationsLoaded] = useState(false);

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

  const handleRestore = async (candidateId: string) => {
    try {
      await candidatesService.restore(candidateId);
      await loadCandidates();
    } catch (err) {
      console.error("Failed to restore candidate:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Реестр кандидатов</h1>
      </div>

      {loading ? (
        <div className={styles.candidatesList}>Загрузка...</div>
      ) : error ? (
        <div className={styles.candidatesList}>Ошибка: {error}</div>
      ) : sortedCandidates.length === 0 ? (
        <div className={styles.empty}>Кандидаты не найдены</div>
      ) : (
        <Accordion
          type="multiple"
          className={styles.candidatesList}
          value={expandedCandidates}
          onValueChange={setExpandedCandidates}
        >
          {sortedCandidates.map((candidate) => (
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
            />
          ))}
        </Accordion>
      )}
    </div>
  );
}
