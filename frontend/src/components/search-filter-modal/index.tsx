import { useState } from "react";
import Button from "@/components/ui/button";
import type { SearchFilters } from "@/api/search";
import { DEFAULT_SEARCH_FILTERS } from "@/api/search";
import { useModal } from "@/providers/ModalProvider";
import styles from "./styles.module.css";

interface SearchFiltersModalProps {
  initialFilters?: SearchFilters;
  onApplyFilters?: (filters: SearchFilters) => void;
}

const LEVELS = [
  { value: 0, label: "Junior" },
  { value: 1, label: "Middle" },
  { value: 2, label: "Senior" },
];

const CANDIDATE_STATUSES = [
  { value: 0, label: "Новый" },
  { value: 1, label: "В процессе" },
  { value: 2, label: "На рассмотрении" },
  { value: 3, label: "Принят" },
  { value: 4, label: "Отклонен" },
];

export function SearchFiltersModal({ initialFilters, onApplyFilters }: SearchFiltersModalProps) {
  const { closeModal } = useModal();
  const [filters, setFilters] = useState<SearchFilters>(initialFilters ?? DEFAULT_SEARCH_FILTERS);

  const toggleLevel = (level: number) => {
    setFilters(prev => ({
      ...prev,
      vacancyLevels: prev.vacancyLevels.includes(level)
        ? prev.vacancyLevels.filter(l => l !== level)
        : [...prev.vacancyLevels, level],
    }));
  };

  const toggleCandidateStatus = (status: number) => {
    setFilters(prev => ({
      ...prev,
      candidateStatuses: prev.candidateStatuses.includes(status)
        ? prev.candidateStatuses.filter(s => s !== status)
        : [...prev.candidateStatuses, status],
    }));
  };

  const handleApply = () => {
    onApplyFilters?.(filters);
    closeModal();
  };

  const handleReset = () => {
    setFilters(DEFAULT_SEARCH_FILTERS);
  };

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Статус вакансии</h3>
        <div className={styles.radioGroup}>
          {(["all", "active", "archived"] as const).map(status => (
            <label key={status} className={styles.radioLabel}>
              <input
                type="radio"
                name="vacancyStatus"
                checked={filters.vacancyStatus === status}
                onChange={() => setFilters(prev => ({ ...prev, vacancyStatus: status }))}
              />
              {status === "all" ? "Все" : status === "active" ? "Активные" : "Архивные"}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Уровень вакансии</h3>
        <div className={styles.checkboxGroup}>
          {LEVELS.map(({ value, label }) => (
            <label key={value} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.vacancyLevels.includes(value)}
                onChange={() => toggleLevel(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Статус отклика кандидата</h3>
        <div className={styles.checkboxGroup}>
          {CANDIDATE_STATUSES.map(({ value, label }) => (
            <label key={value} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.candidateStatuses.includes(value)}
                onChange={() => toggleCandidateStatus(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Город кандидата</h3>
        <input
          type="text"
          value={filters.city}
          onChange={e => setFilters(prev => ({ ...prev, city: e.target.value }))}
          placeholder="Например: Москва"
          className={styles.textInput}
        />
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={handleReset}>
          Сбросить
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Применить
        </Button>
      </div>
    </div>
  );
}
