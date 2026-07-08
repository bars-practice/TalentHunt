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

function parseInitialDate(initialDate?: string): { date: string; time: string } {
  if (!initialDate) return { date: "", time: "" };

  const parsed = new Date(initialDate.includes(" ") ? initialDate.replace(" ", "T") : initialDate);
  if (Number.isNaN(parsed.getTime())) return { date: "", time: "" };

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}

function toIsoDateTime(date: string, time?: string): string {
  const isoLocal = time ? `${date}T${time}:00` : `${date}T00:00:00`;
  const parsed = new Date(isoLocal);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date");
  }
  return parsed.toISOString();
}

export function DateTimePickerModal({ initialDate, onSave, onCancel }: DateTimePickerModalProps) {
  const initial = parseInitialDate(initialDate);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);

  const today = new Date().toISOString().split("T")[0];

  const handleSave = () => {
    if (!date) return;
    onSave(toIsoDateTime(date, time || undefined));
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
