import styles from "./styles.module.css";

interface StatusBadgeProps {
  text: string;
  variant: "success" | "neutral" | "danger" | "warning" | "info";
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ text, variant, size = "md" }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]}`}>
      {text}
    </span>
  );
}
