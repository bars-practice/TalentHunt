import { useEffect, useMemo, useState } from "react";
import { InterviewCard } from "@/components/interview-card";
import {
  ApplicationStatus,
  interviewsService,
  type InterviewListItem,
} from "@/api/interviews";
import styles from "./styles.module.css";

interface InterviewGroup {
  key: string;
  label: string;
  items: InterviewListItem[];
}

function sortInterviews(items: InterviewListItem[]) {
  return [...items].sort((a, b) => {
    const aTime = a.scheduledAt
      ? new Date(a.scheduledAt).getTime()
      : Number.POSITIVE_INFINITY;
    const bTime = b.scheduledAt
      ? new Date(b.scheduledAt).getTime()
      : Number.POSITIVE_INFINITY;

    if (aTime !== bTime) return aTime - bTime;
    return a.candidateFullName.localeCompare(b.candidateFullName, "ru");
  });
}

function groupInterviews(items: InterviewListItem[]): InterviewGroup[] {
  const sorted = sortInterviews(items);
  const groups = new Map<string, InterviewGroup>();
  const withoutDate: InterviewListItem[] = [];

  for (const item of sorted) {
    if (!item.scheduledAt) {
      withoutDate.push(item);
      continue;
    }

    const date = new Date(item.scheduledAt);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const label = date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    });

    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, { key, label, items: [item] });
    }
  }

  const result = Array.from(groups.values());

  if (withoutDate.length > 0) {
    result.push({
      key: "no-date",
      label: "Дата не назначена",
      items: withoutDate,
    });
  }

  return result;
}

export function Interviews() {
  const [interviews, setInterviews] = useState<InterviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await interviewsService.getAll({
          applicationStatus: ApplicationStatus.InProgress,
        });
        setInterviews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить расписание");
      } finally {
        setLoading(false);
      }
    };

    void loadInterviews();
  }, []);

  const groups = useMemo(() => groupInterviews(interviews), [interviews]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Расписание собеседований</h1>
        {!loading && !error && (
          <span className={styles.count}>
            {interviews.length}{" "}
            {interviews.length === 1
              ? "собеседование"
              : interviews.length >= 2 && interviews.length <= 4
                ? "собеседования"
                : "собеседований"}
          </span>
        )}
      </div>

      {loading ? (
        <div className={styles.state}>Загрузка...</div>
      ) : error ? (
        <div className={styles.state}>Ошибка: {error}</div>
      ) : interviews.length === 0 ? (
        <div className={styles.state}>Нет запланированных собеседований</div>
      ) : (
        <div className={styles.schedule}>
          {groups.map((group) => (
            <section key={group.key} className={styles.dayGroup}>
              <h2 className={styles.dayTitle}>{group.label}</h2>
              <div className={styles.list}>
                {group.items.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
