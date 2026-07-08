import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useModal } from "@/providers/ModalProvider";
import { SearchFiltersModal } from "./search-filters-modal";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import styles from "./styles.module.css";

interface GlobalSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function GlobalSearch({ onSearch, placeholder = "Поиск по вакансиям и кандидатам..." }: GlobalSearchProps) {
  const { openModal } = useModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const handleOpenFilters = () => {
    openModal(<SearchFiltersModal />, { title: "Фильтры поиска", width: "500px" });
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
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpenFilters}
        className={styles.filterButton}
      >
        <Filter size={18} />
      </Button>
    </div>
  );
}
