import { Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/status-badge";
import { getApplicationStatusInfo } from "@/utils/applicationStatus";
import type { InterviewListItem } from "@/api/interviews";
import styles from "./styles.module.css";

interface InterviewCardProps {
  interview: InterviewListItem;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).slice(-2)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function InterviewCard({ interview }: InterviewCardProps) {
  const statusInfo = getApplicationStatusInfo(interview.applicationStatus);

  return (
    <Link to={`/assessment/${interview.applicationId}`} className={styles.card}>
      <div className={styles.main}>
        <div className={styles.nameRow}>
          <span className={styles.candidateName}>{interview.candidateFullName}</span>
          <StatusBadge text={statusInfo.text} variant={statusInfo.variant} />
        </div>
        <div className={styles.vacancyTitle}>{interview.vacancyTitle}</div>
        {interview.scheduledAt && (
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <Calendar size={14} />
              {formatDateTime(interview.scheduledAt)}
            </span>
          </div>
        )}
      </div>
      <ChevronRight size={20} className={styles.chevron} />
    </Link>
  );
}
