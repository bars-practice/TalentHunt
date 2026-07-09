import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useModal } from "@/providers/ModalProvider";
import { SearchFiltersModal } from "@/components/search-filter-modal";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import type { SearchFilters } from "@/api/search";
import { DEFAULT_SEARCH_FILTERS } from "@/api/search";
import styles from "./styles.module.css";

interface GlobalSearchProps {
  onSearch?: (query: string) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  filters?: SearchFilters;
  placeholder?: string;
  showFilters?: boolean;
}

export function GlobalSearch({
  onSearch,
  onFiltersChange,
  filters,
  placeholder = "Поиск по вакансиям и кандидатам...",
  showFilters = true,
}: GlobalSearchProps) {
  const { openModal } = useModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const currentFilters = filters ?? DEFAULT_SEARCH_FILTERS;
  const hasActiveFilters =
    currentFilters.vacancyStatus !== "all" ||
    currentFilters.vacancyLevels.length > 0 ||
    currentFilters.candidateStatuses.length > 0 ||
    currentFilters.city.trim().length > 0;

  const handleOpenFilters = () => {
    openModal(
      <SearchFiltersModal
        initialFilters={currentFilters}
        onApplyFilters={onFiltersChange}
      />,
      { title: "Фильтры поиска", width: "500px" }
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>
      {showFilters && (
      <Button
        variant="outline"
        size="md"
        onClick={handleOpenFilters}
        className={`${styles.filterButton} ${hasActiveFilters ? styles.filterButtonActive : ""}`}
      >
        <Filter size={18} />
        {hasActiveFilters && <span className={styles.filterBadge} />}
        Фильтры

      </Button>
      )}
    </div>
  );
}
