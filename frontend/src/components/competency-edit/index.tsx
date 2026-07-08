import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import styles from "./styles.module.css";

interface CompetencyEditProps {
  value?: number;
  onChange?: (value: number) => void;
}

export function CompetencyEdit({ value, onChange }: CompetencyEditProps) {
  return (
    <div className={styles.container}>
      <RadioGroup
        value={value?.toString()}
        onValueChange={(val) => onChange?.(parseInt(val))}
        className={styles.radioGroup}
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <RadioGroupItem
            key={num}
            value={num.toString()}
            className={styles.radioItem}
          />
        ))}
      </RadioGroup>
    </div>
  );
}
