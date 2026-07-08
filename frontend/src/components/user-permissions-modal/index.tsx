import { useState } from "react";
import { useModal } from "@/providers/ModalProvider";
import {
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  type Permission,
} from "@/utils/permissions";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Label from "@/components/ui/label";
import styles from "./styles.module.css";

interface UserPermissionsModalProps {
  permissions: Permission[];
  onSave: (permissions: Permission[]) => void;
}

export function UserPermissionsModal({ permissions, onSave }: UserPermissionsModalProps) {
  const { closeModal } = useModal();
  const [localPermissions, setLocalPermissions] = useState<Permission[]>(permissions);
  const [error, setError] = useState<string | null>(null);

  const togglePermission = (permission: Permission, checked: boolean) => {
    setError(null);
    setLocalPermissions((prev) =>
      checked ? [...prev, permission] : prev.filter((p) => p !== permission)
    );
  };

  const handleSave = () => {
    if (localPermissions.length === 0) {
      setError("Выберите хотя бы одно право");
      return;
    }
    onSave(localPermissions);
    closeModal();
  };

  return (
    <div className={styles.container}>
      <div className={styles.permissionsGrid}>
        {PERMISSION_GROUPS.map((group) => (
          <div key={group.label} className={styles.permissionGroup}>
            <span className={styles.groupLabel}>{group.label}</span>
            <div className={styles.permissionItems}>
              {group.permissions.map((permission) => (
                <label key={permission} className={styles.permissionItem}>
                  <Checkbox
                    checked={localPermissions.includes(permission)}
                    onCheckedChange={(checked) => togglePermission(permission, checked === true)}
                  />
                  <Label className={styles.permissionLabel}>
                    {PERMISSION_LABELS[permission]}
                  </Label>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <p className={styles.hint}>
        Изменения прав вступят в силу после повторного входа пользователя
      </p>

      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={closeModal}>
          Отмена
        </Button>
        <Button type="button" variant="primary" onClick={handleSave}>
          Сохранить
        </Button>
      </div>
    </div>
  );
}
