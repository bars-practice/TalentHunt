import { CandidateCard } from "@/components/candidate-card";
import { candidatesService } from "@/api/candidates";
import { Permission } from "@/utils/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import styles from "./styles.module.css";
import { useEffect, useState } from "react";

export function Candidates() {
  const { hasPermission } = usePermissions();
  const canRestoreCandidates = hasPermission(Permission.CanManageUsers);
  const [candidates, setCandidates] = useState<Awaited<ReturnType<typeof candidatesService.getAll>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    void loadCandidates();
  }, []);

  const sortedCandidates = [...candidates].sort((a, b) => {
    if (!!a.isDeleted === !!b.isDeleted) {
      return a.fullName.localeCompare(b.fullName, "ru");
    }
    return a.isDeleted ? 1 : -1;
  });

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
        <h1 className={styles.title}>Кандидаты</h1>
      </div>
      {loading ? (
        <div className={styles.list}>Загрузка...</div>
      ) : error ? (
        <div className={styles.list}>Ошибка: {error}</div>
      ) : sortedCandidates.length === 0 ? (
        <div className={styles.empty}>Кандидаты не найдены</div>
      ) : (
        <div className={styles.list}>
          {sortedCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              name={candidate.fullName}
              city={candidate.city}
              status={candidate.isDeleted ? "blocked" : "active"}
              canRestore={canRestoreCandidates}
              onRestore={() => handleRestore(candidate.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
