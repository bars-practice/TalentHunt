import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Plus } from "lucide-react";
import SimpleBar from "simplebar-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import styles from "./styles.module.css";

import "simplebar-react/dist/simplebar.min.css";

export interface Competency {
  id: string;
  name: string;
}

interface CompetencyAutocompleteProps {
  label: string;
  allCompetencies: Competency[];
  selectedIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onAddNewCompetency?: (name: string) => string | undefined;
  error?: string;
  placeholder?: string;
}

export function CompetencyAutocomplete({
  label,
  allCompetencies,
  selectedIds,
  onAdd,
  onRemove,
  onAddNewCompetency,
  error,
  placeholder = "Поиск компетенций...",
}: CompetencyAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [newCompetencies, setNewCompetencies] = useState<Competency[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const allCompetenciesWithNew = [...allCompetencies, ...newCompetencies];
  const selectedCompetencies = allCompetenciesWithNew.filter((c) => selectedIds.includes(c.id));
  const filteredCompetencies = allCompetencies.filter(
    (c) =>
      !selectedIds.includes(c.id) &&
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedHighlight})`, "gi"));

    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className={styles.highlight}>{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const updateCoords = () => {
    if (inputWrapperRef.current) {
      const rect = inputWrapperRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (focusedIndex >= 0 && dropdownRef.current) {
      const options = dropdownRef.current.querySelectorAll(`.${styles.option}`);
      const activeOption = options[focusedIndex] as HTMLElement;
      if (activeOption) {
        activeOption.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }
  }, [focusedIndex]);

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("resize", updateCoords);
      window.addEventListener("scroll", updateCoords, true);
    }
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !target.closest(`.${styles.dropdown}`)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery, filteredCompetencies.length]);

  const handleSelectCompetency = (id: string) => {
    onAdd(id);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleAddNewCompetency = () => {
    if (searchQuery.trim() && onAddNewCompetency) {
      const newId = onAddNewCompetency(searchQuery.trim());
      if (newId) {
        setNewCompetencies((prev) => [...prev, { id: newId, name: searchQuery.trim() }]);
        onAdd(newId);
        setSearchQuery("");
        setIsOpen(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        return;
      }
    }

    if (filteredCompetencies.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault(); // Запрещаем курсору прыгать в конец инпута
      setFocusedIndex((prev) => (prev + 1) % filteredCompetencies.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + filteredCompetencies.length) % filteredCompetencies.length);
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && focusedIndex < filteredCompetencies.length) {
        e.preventDefault();
        handleSelectCompetency(filteredCompetencies[focusedIndex].id);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <Field>
      <div ref={containerRef} className={styles.autocompleteWrapper}>
        <FieldLabel htmlFor="competency-search">{label}</FieldLabel>
        <FieldContent>
          <div ref={inputWrapperRef} className={styles.inputWrapper}>
            <Input
              id="competency-search"
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              aria-invalid={!!error}
              autoComplete="off"
              className={styles.inputWithButton}
            />
            {searchQuery.trim() && filteredCompetencies.length === 0 && onAddNewCompetency && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={styles.addButton}
                onClick={handleAddNewCompetency}
                title="Добавить новую компетенцию"
              >
                <Plus size={14} />
              </Button>
            )}
          </div>
          <FieldError errors={[error ? { message: error } : undefined]} />
        </FieldContent>

        {isOpen && filteredCompetencies.length > 0 && typeof document !== "undefined" &&
          createPortal(
            <div
              ref={dropdownRef}
              className={styles.dropdown}
              style={{
                position: "absolute",
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                width: `${coords.width}px`,
                zIndex: 9999,
              }}
            >
              <SimpleBar style={{ maxHeight: "200px" }} autoHide={true}>
                {filteredCompetencies.map((competency, index) => (
                  <div
                    key={competency.id}
                    className={`${styles.option} ${index === focusedIndex ? styles.optionFocused : ""}`}
                    onClick={() => handleSelectCompetency(competency.id)}
                    onMouseMove={() => {
                      if (focusedIndex !== index) setFocusedIndex(index);
                    }}
                  >
                    {renderHighlightedText(competency.name, searchQuery)}
                  </div>
                ))}
              </SimpleBar>
            </div>,
            document.body
          )
        }
      </div>

      {selectedCompetencies.length > 0 && (
        <div className={styles.selectedTags}>
          {selectedCompetencies.map((competency) => (
            <div key={competency.id} className={styles.tag}>
              <span className={styles.tagText}>{competency.name}</span>
              <button type="button" className={styles.removeButton} onClick={() => onRemove(competency.id)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Field>
  );
}