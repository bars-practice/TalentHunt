import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import SimpleBar from "simplebar-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useModal } from "@/providers/ModalProvider";
import { competenciesService, type Competency } from "@/api/competencies";
import { ApiError } from "@/api/client";
import styles from "./styles.module.css";

import "simplebar-react/dist/simplebar.min.css";

interface CompetencyManageModalProps {
  onUpdated?: () => void | Promise<void>;
  onDeleted?: (id: string) => void;
}

export function CompetencyManageModal({ onUpdated, onDeleted }: CompetencyManageModalProps) {
  const { openModal, closeModal } = useModal();
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCompetencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await competenciesService.getAll();
      setCompetencies(data.filter((c) => !c.isDeleted));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить компетенции");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCompetencies();
  }, [loadCompetencies]);

  const handleStartEdit = (competency: Competency) => {
    setEditingId(competency.id);
    setEditName(competency.name);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditError(null);
  };

  const handleSaveEdit = async (id: string) => {
    const name = editName.trim();
    if (!name) {
      setEditError("Введите название");
      return;
    }

    try {
      setSavingId(id);
      setEditError(null);
      await competenciesService.update(id, { name });
      await loadCompetencies();
      await onUpdated?.();
      handleCancelEdit();
    } catch (err) {
      if (err instanceof ApiError) {
        setEditError(err.message);
      } else {
        setEditError(err instanceof Error ? err.message : "Не удалось сохранить");
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteClick = (competency: Competency) => {
    openModal(
      <div className={styles.confirmContent}>
        <p className={styles.confirmText}>
          Компетенция «{competency.name}» будет скрыта из справочника.
          В существующих вакансиях и протоколах она сохранится.
        </p>
        <div className={styles.confirmActions}>
          <Button variant="outline" onClick={closeModal}>
            Отмена
          </Button>
          <Button
            variant="danger"
            disabled={deletingId === competency.id}
            onClick={async () => {
              try {
                setDeletingId(competency.id);
                await competenciesService.delete(competency.id);
                await loadCompetencies();
                onDeleted?.(competency.id);
                await onUpdated?.();
                closeModal();
              } catch (err) {
                console.error("Failed to delete competency:", err);
              } finally {
                setDeletingId(null);
              }
            }}
          >
            Удалить
          </Button>
        </div>
      </div>,
      { title: "Удалить компетенцию?", width: "440px" }
    );
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <div className={styles.state}>Загрузка...</div>
      ) : error ? (
        <div className={styles.state}>Ошибка: {error}</div>
      ) : competencies.length === 0 ? (
        <div className={styles.state}>Компетенций пока нет</div>
      ) : (
        <SimpleBar className={styles.list}>
          <ul className={styles.items}>
            {competencies.map((competency) => {
              const isEditing = editingId === competency.id;

              return (
                <li key={competency.id} className={styles.item}>
                  {isEditing ? (
                    <div className={styles.editForm}>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Название"
                        aria-invalid={!!editError}
                      />
                      {editError && <p className={styles.editError}>{editError}</p>}
                      <div className={styles.editActions}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={savingId === competency.id}
                        >
                          <X size={16} />
                          Отмена
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={savingId === competency.id}
                          onClick={() => void handleSaveEdit(competency.id)}
                        >
                          <Check size={16} />
                          Сохранить
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.row}>
                      <div className={styles.info}>
                        <span className={styles.name}>{competency.name}</span>
                      </div>
                      <div className={styles.actions}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title="Редактировать"
                          onClick={() => handleStartEdit(competency)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title="Удалить"
                          onClick={() => handleDeleteClick(competency)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </SimpleBar>
      )}
    </div>
  );
}
