import { useMemo, useState } from "react";
import { useModal } from "@/providers/ModalProvider";
import {
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  PERMISSION_ASSIGNMENT_HINTS,
  getPermissionAssignmentState,
  type Permission,
} from "@/utils/permissions";
import type { User } from "@/api/auth";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Label from "@/components/ui/label";
import styles from "./styles.module.css";

interface UserPermissionsModalProps {
  permissions: Permission[];
  caller: User;
  availablePermissionNames: ReadonlySet<string>;
  onSave: (permissions: Permission[]) => void;
}

export function UserPermissionsModal({
  permissions,
  caller,
  availablePermissionNames,
  onSave,
}: UserPermissionsModalProps) {
  const { closeModal } = useModal();
  const [localPermissions, setLocalPermissions] = useState<Permission[]>(permissions);
  const [error, setError] = useState<string | null>(null);

  const lockedPermissions = useMemo(
    () =>
      permissions.filter(
        (permission) =>
          getPermissionAssignmentState(caller, permission, availablePermissionNames) !== "assignable"
      ),
    [permissions, caller, availablePermissionNames]
  );

  const togglePermission = (permission: Permission, checked: boolean) => {
    if (getPermissionAssignmentState(caller, permission, availablePermissionNames) !== "assignable") {
      return;
    }

    setError(null);
    setLocalPermissions((prev) =>
      checked ? [...prev, permission] : prev.filter((p) => p !== permission)
    );
  };

  const handleSave = () => {
    const assignableSelected = localPermissions.filter(
      (permission) =>
        getPermissionAssignmentState(caller, permission, availablePermissionNames) === "assignable"
    );

    if (assignableSelected.length === 0 && lockedPermissions.length === 0) {
      setError("Выберите хотя бы одно право");
      return;
    }

    const merged = [...new Set([...lockedPermissions, ...assignableSelected])];
    onSave(merged);
    closeModal();
  };

  return (
    <div className={styles.container}>
      <div className={styles.permissionsGrid}>
        {PERMISSION_GROUPS.map((group) => (
          <div key={group.label} className={styles.permissionGroup}>
            <span className={styles.groupLabel}>{group.label}</span>
            <div className={styles.permissionItems}>
              {group.permissions.map((permission) => {
                const assignmentState = getPermissionAssignmentState(
                  caller,
                  permission,
                  availablePermissionNames
                );
                const isAssignable = assignmentState === "assignable";
                const isChecked =
                  localPermissions.includes(permission) || lockedPermissions.includes(permission);
                const hint = !isAssignable ? PERMISSION_ASSIGNMENT_HINTS[assignmentState] : undefined;

                return (
                  <label
                    key={permission}
                    className={`${styles.permissionItem} ${!isAssignable ? styles.permissionItemDisabled : ""}`}
                    title={hint}
                  >
                    <Checkbox
                      checked={isChecked}
                      disabled={!isAssignable}
                      onCheckedChange={(checked) => togglePermission(permission, checked === true)}
                    />
                    <Label className={styles.permissionLabel}>{PERMISSION_LABELS[permission]}</Label>
                  </label>
                );
              })}
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
