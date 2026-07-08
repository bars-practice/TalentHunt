import { useState } from "react";
import Button from "@/components/ui/button";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import Input from "@/components/ui/input";
import styles from "./styles.module.css";

interface DateTimePickerModalProps {
  initialDate?: string;
  onSave: (date: string) => void;
  onCancel: () => void;
}

export function DateTimePickerModal({ initialDate, onSave, onCancel }: DateTimePickerModalProps) {
  const [date, setDate] = useState(initialDate ? initialDate.split(" ")[0] : "");
  const [time, setTime] = useState(initialDate ? initialDate.split(" ")[1] : "");

  const today = new Date().toISOString().split('T')[0];

  const handleSave = () => {
    if (date && time) {
      onSave(`${date} ${time}`);
    } else if (date) {
      onSave(date);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.fields}>
        <Field>
          <FieldLabel htmlFor="date">Дата</FieldLabel>
          <FieldContent>
            <Input
              id="date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="time">Время</FieldLabel>
          <FieldContent>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </FieldContent>
        </Field>
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!date}>
          Сохранить
        </Button>
      </div>
    </div>
  );
}
