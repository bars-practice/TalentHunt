import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/status-badge";
import { getApplicationStatusInfo, parseApplicationStatus } from "@/utils/applicationStatus";
import type { Application } from "@/api/applications";
import styles from "./styles.module.css";

interface CandidateApplicationsProps {
  applications: Application[] | undefined;
  isLoading: boolean;
}

function formatDate(value: string) {
  const date = new Date(value);
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).slice(-2)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function sortApplications(applications: Application[]) {
  return [...applications].sort((a, b) => {
    const statusDiff = parseApplicationStatus(a.status) - parseApplicationStatus(b.status);
    if (statusDiff !== 0) return statusDiff;

    const aTime = a.interviewScheduledAt
      ? new Date(a.interviewScheduledAt).getTime()
      : Number.POSITIVE_INFINITY;
    const bTime = b.interviewScheduledAt
      ? new Date(b.interviewScheduledAt).getTime()
      : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });
}

export function CandidateApplications({ applications, isLoading }: CandidateApplicationsProps) {
  if (isLoading) {
    return <div className={styles.loadingText}>Загрузка откликов...</div>;
  }

  if (!applications || applications.length === 0) {
    return <div className={styles.empty}>Нет откликов</div>;
  }

  return (
    <div className={styles.applicationsList}>
      {sortApplications(applications).map((application) => {
        const statusInfo = getApplicationStatusInfo(application.status);

        return (
          <div key={application.id} className={styles.applicationItem}>
            <div className={styles.applicationInfo}>
              <Link to={`/assessment/${application.id}`} className={styles.applicationTitle}>
                {application.vacancyTitle}
              </Link>
              {application.interviewScheduledAt && (
                <div className={styles.applicationDate}>
                  <Calendar size={14} />
                  <span>{formatDate(application.interviewScheduledAt)}</span>
                </div>
              )}
            </div>
            <StatusBadge text={statusInfo.text} variant={statusInfo.variant} />
          </div>
        );
      })}
    </div>
  );
}
