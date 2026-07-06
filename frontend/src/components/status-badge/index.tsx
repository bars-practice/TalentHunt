import styles from "./styles.module.css";

interface StatusBadgeProps {
  text: string;
  variant: "success" | "neutral" | "danger" | "warning";
}

export function StatusBadge({ text, variant }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {text}
    </span>
  );
}
