import Button from "@/components/ui/button";
import { UserRoundPlus } from "lucide-react";
import styles from "./candidate-item.module.css";

interface Candidate {
  id: string;
  fullName: string;
  city: string;
}

interface CandidateItemProps {
  candidate: Candidate;
  onAdd: (candidateId: string) => void;
  disabled?: boolean;
}

export function CandidateItem({ candidate, onAdd, disabled }: CandidateItemProps) {
  return (
    <div className={styles.candidateRow}>
      <div className={styles.candidateInfo}>
        <span className={styles.candidateName}>{candidate.fullName}</span>
        <span className={styles.candidateCity}>{candidate.city}</span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        disabled={disabled}
        onClick={() => onAdd(candidate.id)}
      >
        <UserRoundPlus size={16} />
      </Button>
    </div>
  );
}
