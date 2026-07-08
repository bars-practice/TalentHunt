import { useState } from "react";
import Button from "@/components/ui/button";
import type { SearchFilters } from "@/api/search";
import styles from "./search-filters-modal.module.css";

interface SearchFiltersModalProps {
  onApplyFilters?: (filters: SearchFilters) => void;
  onCancel?: () => void;
}

export function SearchFiltersModal({ onApplyFilters, onCancel }: SearchFiltersModalProps) {
  const [selectedTypes, setSelectedTypes] = useState<SearchFilters['types']>([
    'candidate',
    'vacancy',
    'application',
    'interview',
  ]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleTypeToggle = (type: 'candidate' | 'vacancy' | 'application' | 'interview') => {
    setSelectedTypes(prev => {
      if (prev?.includes(type)) {
        return prev.filter(t => t !== type);
      }
      return [...(prev || []), type];
    });
  };

  const handleApply = () => {
    const filters: SearchFilters = {
      types: selectedTypes,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };
    onApplyFilters?.(filters);
    onCancel?.();
  };

  const handleReset = () => {
    setSelectedTypes(['candidate', 'vacancy', 'application', 'interview']);
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Типы объектов</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={selectedTypes?.includes('candidate')}
              onChange={() => handleTypeToggle('candidate')}
            />
            Кандидаты
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={selectedTypes?.includes('vacancy')}
              onChange={() => handleTypeToggle('vacancy')}
            />
            Вакансии
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={selectedTypes?.includes('application')}
              onChange={() => handleTypeToggle('application')}
            />
            Отклики
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={selectedTypes?.includes('interview')}
              onChange={() => handleTypeToggle('interview')}
            />
            Собеседования
          </label>
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Период</h3>
        <div className={styles.dateInputs}>
          <div className={styles.dateField}>
            <label className={styles.dateLabel}>От</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.dateField}>
            <label className={styles.dateLabel}>До</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={styles.dateInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={handleReset}>
          Сбросить
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Применить
        </Button>
      </div>
    </div>
  );
}
