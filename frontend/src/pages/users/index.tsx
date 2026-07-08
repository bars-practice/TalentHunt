import { UserCard } from "@/components/user-card";
import { UserFormModal } from "@/components/user-form-modal";
import { getRoleLabel } from "@/utils/role";
import { canManageUser } from "@/utils/permissions";
import styles from "./styles.module.css";
import Button from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useModal } from "@/providers/ModalProvider";
import { usersService } from "@/api/users";
import { Role } from "@/api/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { useEffect, useState } from "react";

export function Users() {
  const { openModal } = useModal();
  const { user: currentUser } = usePermissions();
  const [users, setUsers] = useState<Awaited<ReturnType<typeof usersService.getAll>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getAll();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const sortedUsers = [...users].sort((a, b) => {
    if (a.isDeleted === b.isDeleted) return 0;
    return a.isDeleted ? 1 : -1;
  });

  const handleAddUser = () => {
    if (!currentUser) return;

    openModal(
      <UserFormModal
        mode="create"
        callerRole={currentUser.role}
        onSubmit={async (data) => {
          try {
            await usersService.create({
              fullName: data.fullName,
              password: data.password!,
              role: data.role,
              permissions: data.permissions,
            });
            await loadUsers();
          } catch (err) {
            console.error("Failed to create user:", err);
          }
        }}
      />,
      { title: "Добавить пользователя", width: "560px" }
    );
  };

  const handleEdit = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user || !currentUser) return;

    const isSelf = user.id === currentUser.id;
    const isSuperAdminSelf = isSelf && user.role === Role.SuperAdmin;
    const isAdminSelf = isSelf && user.role === Role.Admin;

    openModal(
      <UserFormModal
        mode="edit"
        callerRole={currentUser.role}
        isSelf={isSelf}
        isSuperAdminSelf={isSuperAdminSelf}
        initialData={{
          fullName: user.fullName,
          role: user.role,
          permissions: user.permissions,
        }}
        onSubmit={async (data) => {
          try {
            if (isSuperAdminSelf) {
              if (!data.password) return;
              await usersService.update(userId, { password: data.password });
            } else if (isAdminSelf) {
              await usersService.update(userId, {
                fullName: data.fullName,
                password: data.password,
              });
            } else {
              await usersService.update(userId, {
                fullName: data.fullName,
                role: data.role,
                password: data.password,
                permissions: data.permissions,
              });
            }
            await loadUsers();
          } catch (err) {
            console.error("Failed to update user:", err);
          }
        }}
      />,
      {
        title: isSuperAdminSelf ? "Сменить пароль" : "Изменить пользователя",
        width: "560px",
      }
    );
  };

  const handleDelete = async (userId: string) => {
    try {
      await usersService.delete(userId);
      await loadUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleRestore = async (userId: string) => {
    try {
      await usersService.restore(userId);
      await loadUsers();
    } catch (err) {
      console.error("Failed to restore user:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление пользователями</h1>
        <Button size="lg" variant="primary" className={styles.addButton} onClick={handleAddUser}>
          <UserPlus size={20} />
          Добавить пользователя
        </Button>
      </div>
      {loading ? (
        <div className={styles.usersList}>Загрузка...</div>
      ) : error ? (
        <div className={styles.usersList}>Ошибка: {error}</div>
      ) : (
        <div className={styles.usersList}>
          {sortedUsers.map((user) => {
            const access = currentUser
              ? canManageUser(currentUser, user)
              : { canEdit: false, canDelete: false, canRestore: false };

            return (
              <UserCard
                key={user.id}
                name={user.fullName}
                status={user.isDeleted ? "inactive" : "active"}
                role={getRoleLabel(user.role)}
                canEdit={access.canEdit}
                canDelete={access.canDelete}
                canRestore={access.canRestore}
                onEdit={() => handleEdit(user.id)}
                onDelete={() => handleDelete(user.id)}
                onRestore={() => handleRestore(user.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
