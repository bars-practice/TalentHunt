import { NavLink } from "react-router-dom";
import { Users, Calendar, Briefcase, LogOut, User as UserIcon } from "lucide-react";
import styles from "./styles.module.css";
import logo from "@/assets/logo-dark.svg";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Role } from "@/api/auth";

type UserRole = Role;

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

interface SideMenuProps {
  onLogout: () => void;
}

const menuItems: MenuItem[] = [
  {
    path: "/candidates",
    label: "Кандидаты",
    icon: <UserIcon size={20} />,
    roles: [Role.HrDirector, Role.Recruiter, Role.Admin],
  },
  {
    path: "/interviews",
    label: "Собеседования",
    icon: <Calendar size={20} />,
    roles: [Role.HrDirector, Role.Recruiter, Role.Admin],
  },
  {
    path: "/vacancies",
    label: "Вакансии",
    icon: <Briefcase size={20} />,
    roles: [Role.HrDirector, Role.Recruiter, Role.Admin],
  },
  {
    path: "/users",
    label: "Пользователи",
    icon: <Users size={20} />,
    roles: [Role.Admin],
  },
];

export function SideMenu({ onLogout }: SideMenuProps) {
  const { user, loading } = useCurrentUser();

  if (loading || !user) {
    return null;
  }

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
  );

  const getRoleLabel = (role: Role): string => {
    switch (role) {
      case Role.Admin:
        return "Администратор";
      case Role.Recruiter:
        return "Рекрутер";
      case Role.HrDirector:
        return "HR Директор";
      default:
        return "Пользователь";
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src={logo} alt="БАРС ГРУП" className={styles.logoImage} />
      </div>

      <nav className={styles.navigation}>
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
          >
            {item.icon}
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user.login}</div>
          <div className={styles.userRole}>{getRoleLabel(user.role)}</div>
        </div>
        <button
          onClick={onLogout}
          aria-label="Выйти"
          className={styles.logoutButton}
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}