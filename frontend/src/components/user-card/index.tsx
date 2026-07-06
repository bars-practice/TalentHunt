import { MoreVertical } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import styles from "./styles.module.css";

interface UserCardProps {
  name: string;
  status: "active" | "inactive";
  role: string;
}

export function UserCard({ name, status, role }: UserCardProps) {
  return (
    <div className={styles.userCard}>
      <div className={styles.userInfo}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{name}</span>
          {status === "active" && <StatusBadge text="АКТИВЕН" variant="success" />}
          {status === "inactive" && <StatusBadge text="УДАЛЕН" variant="danger" />}
        </div>
        <div className={styles.detailsRow}>
          <span className={styles.role}>{role}</span>
        </div>
      </div>
      <button className={styles.menuButton} aria-label="Меню">
        <MoreVertical size={20} />
      </button>
    </div>
  );
}
