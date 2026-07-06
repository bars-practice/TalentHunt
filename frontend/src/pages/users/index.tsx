import { UserCard } from "@/components/user-card";
import { UserFormModal } from "@/components/user-form-modal";
import { getRoleLabel } from "@/utils/role";
import styles from "./styles.module.css";
import Button from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useModal } from "@/providers/ModalProvider";
import { usersService } from "@/api/users";
import type { User } from "@/api/auth";
import { useEffect, useState } from "react";

export function Users() {
  const { openModal } = useModal();
  const [users, setUsers] = useState<User[]>([]);
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
    openModal(
      <UserFormModal
        mode="create"
        onSubmit={async (data) => {
          try {
            await usersService.create({
              fullName: data.fullName,
              login: data.login,
              password: data.password!,
              role: data.role,
            });
            await loadUsers();
          } catch (err) {
            console.error("Failed to create user:", err);
          }
        }}
      />,
      { title: "Добавить пользователя", width: "450px" }
    );
  };

  const handleEdit = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      openModal(
        <UserFormModal
          mode="edit"
          initialData={{ fullName: user.fullName, role: user.role }}
          onSubmit={async (data) => {
            try {
              await usersService.update(userId, {
                fullName: data.fullName,
                role: data.role,
              });
              await loadUsers();
            } catch (err) {
              console.error("Failed to update user:", err);
            }
          }}
        />,
        { title: "Изменить пользователя", width: "450px" }
      );
    }
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
          {sortedUsers.map((user) => (
            <UserCard
              key={user.id}
              name={user.fullName}
              status={user.isDeleted ? "inactive" : "active"}
              role={getRoleLabel(user.role)}
              onEdit={() => handleEdit(user.id)}
              onDelete={() => handleDelete(user.id)}
              onRestore={() => handleRestore(user.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
