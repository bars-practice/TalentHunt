import { MoreVertical } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
import styles from "./styles.module.css";

interface CandidateCardProps {
  name: string;
  city: string;
  status: "active" | "blocked";
  canRestore?: boolean;
  onRestore?: () => void;
}

const STATUS_CONFIG = {
  active: { text: "АКТИВЕН", variant: "success" as const },
  blocked: { text: "ЗАБЛОКИРОВАН", variant: "danger" as const },
};

export function CandidateCard({
  name,
  city,
  status,
  canRestore = false,
  onRestore,
}: CandidateCardProps) {
  const badge = STATUS_CONFIG[status];

  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{name}</span>
          <StatusBadge text={badge.text} variant={badge.variant} />
        </div>
        {city && <span className={styles.city}>{city}</span>}
      </div>

      {status === "blocked" && canRestore && (
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger className={styles.menuButton}>
              <MoreVertical size={20} />
            </MenubarTrigger>
            <MenubarContent align="end">
              <MenubarItem onClick={onRestore}>Восстановить кандидата</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )}
    </div>
  );
}
