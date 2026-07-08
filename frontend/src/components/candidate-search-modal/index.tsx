import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useModal } from "@/providers/ModalProvider";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { candidatesService } from "@/api/candidates";
import { applicationsService } from "@/api/applications";
import { CandidateCreateForm } from "@/components/candidate-create-form";
import { UserPlus } from "lucide-react";
import { CandidateItem } from "./candidate-item";
import styles from "./styles.module.css";

interface Candidate {
  id: string;
  fullName: string;
  city: string;
}

interface CandidateSearchModalProps {
  vacancyId?: string;
  onSuccess?: () => Promise<void>;
}

export function CandidateSearchModal({ vacancyId, onSuccess }: CandidateSearchModalProps) {
  const { updateLastModal } = useModal();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  useEffect(() => {
    updateLastModal({ showBackButton: false, onBackClick: undefined });
    return () => {
      updateLastModal({ showBackButton: false, onBackClick: undefined });
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = debouncedSearchQuery.trim();

    const fetchCandidates = async () => {
      try {
        setIsSearching(true);
        if (trimmedQuery.length === 0) {
          const response = await candidatesService.getAll(vacancyId);
          setSearchResults(Array.isArray(response) ? response : []);
        } else {
          const response = await candidatesService.search(trimmedQuery, vacancyId);
          setSearchResults(Array.isArray(response) ? response : []);
        }
      } catch (err) {
        console.error("Ошибка при загрузке кандидатов:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchCandidates();
  }, [debouncedSearchQuery, vacancyId]);

  const handleSelectExistingCandidate = async (candidateId: string) => {
    if (!vacancyId) return;
    try {
      setActionLoading(true);
      await applicationsService.create({ vacancyId, candidateId });
      if (onSuccess) await onSuccess();
      const response = await candidatesService.getAll(vacancyId);
      setSearchResults(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Ошибка при создании отклика:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setShowCreateForm(false);
    updateLastModal({ showBackButton: false, onBackClick: undefined });
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
    updateLastModal({ showBackButton: true, onBackClick: handleBackToSearch });
  };

  return (
    <>
      {!showCreateForm ? (
        <>
          <div className={styles.searchHeaderRow}>
            <div style={{ flex: 1 }}>
              <Input
                type="text"
                placeholder="Введите ФИО кандидата..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={handleShowCreateForm}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            >
              <UserPlus size={16} />
              Добавить нового
            </Button>
          </div>

          <div className={styles.contentBox}>
            {isSearching ? (
              <div className={styles.statusMessage}>Загрузка кандидатов...</div>
            ) : searchResults.length === 0 ? (
              <div className={styles.statusMessage}>
                Кандидаты не найдены
              </div>
            ) : (
              <div className={styles.searchResults}>
                <div className={styles.candidatesList}>
                  {searchResults.map((candidate) => (
                    <CandidateItem
                      key={candidate.id}
                      candidate={candidate}
                      onAdd={handleSelectExistingCandidate}
                      disabled={actionLoading}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className={styles.contentBox}>
          <CandidateCreateForm
            vacancyId={vacancyId}
            onCancel={handleBackToSearch}
            onSuccess={async () => {
              if (onSuccess) await onSuccess();
              handleBackToSearch();
              const response = await candidatesService.getAll(vacancyId);
              setSearchResults(Array.isArray(response) ? response : []);
            }}
          />
        </div>
      )}
    </>
  );
}