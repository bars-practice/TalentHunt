import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useModal } from "@/providers/ModalProvider";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { usersService, type UserSearchResult } from "@/api/users";
import { UserRoundPlus } from "lucide-react";
import styles from "./styles.module.css";

interface ApproverSearchModalProps {
  onSelectApprover: (approver: { id: string; fullName: string }) => void;
}

export function ApproverSearchModal({ onSelectApprover }: ApproverSearchModalProps) {
  const { closeModal } = useModal();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  useEffect(() => {
    const trimmedQuery = debouncedSearchQuery.trim();

    const fetchApprovers = async () => {
      try {
        setIsSearching(true);
        const response = await usersService.searchByRole("Approver", trimmedQuery);
        setSearchResults(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error("Ошибка при загрузке approvers:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchApprovers();
  }, [debouncedSearchQuery]);

  const handleSelectApprover = async (approver: UserSearchResult) => {
    try {
      setActionLoading(true);
      onSelectApprover({ id: approver.id, fullName: approver.fullName });
      closeModal();
    } catch (err) {
      console.error("Ошибка при выборе approver:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className={styles.searchHeaderRow}>
        <div style={{ flex: 1 }}>
          <Input
            type="text"
            placeholder="Введите логин или ФИО..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.contentBox}>
        {isSearching ? (
          <div className={styles.statusMessage}>Загрузка...</div>
        ) : searchResults.length === 0 ? (
          <div className={styles.statusMessage}>
            {searchQuery.trim().length > 0 ? "Подтверждающие не найдены" : "Нет доступных подтверждающих"}
          </div>
        ) : (
          <div className={styles.searchResults}>
            <div className={styles.approversList}>
              {searchResults.map((approver) => (
                <div key={approver.id} className={styles.approverRow}>
                  <div className={styles.approverInfo}>
                    <span className={styles.approverName}>{approver.fullName}</span>
                    <span className={styles.approverLogin}>{approver.login}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={actionLoading}
                    onClick={() => handleSelectApprover(approver)}
                  >
                    <UserRoundPlus size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
