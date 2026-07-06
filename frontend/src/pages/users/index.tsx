import { UserCard } from "@/components/user-card";
import { Role } from "@/api/auth";
import { getRoleLabel } from "@/utils/role";
import styles from "./styles.module.css";
import Button from "@/components/ui/button";
import { Plus } from "lucide-react";

// !! Mock data - заменить на вызов API
const mockUsers = [
  {
    id: "fa91d3ca-ee93-4b68-9431-1f8cdbef58e6",
    fullName: "Игорь Петров",
    login: "ipetrov",
    role: Role.HrDirector,
    permissions: [],
    isDeleted: false,
  },
  {
    id: "fb82d4db-ff04-5c79-0542-2g9decfg69f7",
    fullName: "Анна Сидорова",
    login: "asidorova",
    role: Role.Recruiter,
    permissions: [],
    isDeleted: false,
  },
  {
    id: "fc93e5ec-gg15-6d80-1653-3h0efdg70g8",
    fullName: "Михаил Козлов",
    login: "mkozlov",
    role: Role.Admin,
    permissions: [],
    isDeleted: true,
  },
  {
    id: "gd04f6fd-hh26-7e91-2764-4i1fgeh81h9",
    fullName: "Елена Новикова",
    login: "enovikova",
    role: Role.Recruiter,
    permissions: [],
    isDeleted: false,
  },
];

export function Users() {
  const sortedUsers = [...mockUsers].sort((a, b) => {
    if (a.isDeleted === b.isDeleted) return 0;
    return a.isDeleted ? 1 : -1;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление пользователями</h1>
        <Button size="lg" variant="primary" className={styles.addButton}>
          <Plus />
          Добавить пользователя
        </Button>
      </div>
      <div className={styles.usersList}>
        {sortedUsers.map((user) => (
          <UserCard
            key={user.id}
            name={user.fullName}
            status={user.isDeleted ? "inactive" : "active"}
            role={getRoleLabel(user.role)}
          />
        ))}
      </div>
    </div>
  );
}
