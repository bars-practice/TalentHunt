import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import styles from "./styles.module.css";
import logo from "@/assets/logo-dark.svg";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { menuItems } from "./menu.config";
import { getRoleLabel } from "@/utils/role";

interface SideMenuProps {
  onLogout: () => void;
}

export function SideMenu({ onLogout }: SideMenuProps) {
  const { user, loading } = useCurrentUser();

  if (loading || !user) {
    return null;
  }

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src={logo} alt="БАРС ГРУП" className={styles.logoImage} />
      </div>

      <nav className={styles.navigation}>
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <Icon size={20} />
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.userDetails}>
            <div className={styles.userName}>{user.fullName || user.login}</div>
            <div className={styles.userRole}>{getRoleLabel(user.role)}</div>
          </div>
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