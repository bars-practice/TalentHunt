import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Textarea from "@/components/ui/textarea";
import styles from "./styles.module.css";

interface CompetencyEditProps {
  title?: string;
  description?: string;
  value?: number;
  onChange?: (value: number) => void;
  comment?: string;
  onCommentChange?: (value: string) => void;
}

export function CompetencyEdit({
  title = "React & State Management",
  value,
  onChange,
  comment,
  onCommentChange,
}: CompetencyEditProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.textContainer}>
          <h3 className={styles.title}>{title}</h3>
          {/* <p className={styles.description}>{description}</p> */}
        </div>

        <RadioGroup
          value={value?.toString()}
          onValueChange={(val) => onChange?.(parseInt(val))}
          className={styles.radioGroup}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <RadioGroupItem
              key={num}
              value={num.toString()}
              asChild
            >
              <div className={styles.gradeVariant}>
                {num}
              </div>
            </RadioGroupItem>
          ))}
        </RadioGroup>
      </div>

      <div className={styles.textareaContainer}>
        <Textarea
          placeholder="Комментарий к оценке"
          value={comment}
          onChange={(e) => onCommentChange?.(e.target.value)}
        />
      </div>
    </div>
  );
}