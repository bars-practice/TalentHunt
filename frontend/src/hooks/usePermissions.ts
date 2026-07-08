import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  hasPermission as checkPermission,
  isAdministrativeRole,
  type Permission,
} from "@/utils/permissions";
import { Role } from "@/api/auth";

export function usePermissions() {
  const { user, loading, logout } = useCurrentUser();

  const hasPermission = (permission: Permission) => checkPermission(user, permission);

  const isAdmin = user?.role === Role.Admin || user?.role === Role.SuperAdmin;
  const isSuperAdmin = user?.role === Role.SuperAdmin;

  return {
    user,
    loading,
    logout,
    hasPermission,
    isAdmin,
    isSuperAdmin,
    isAdministrative: user ? isAdministrativeRole(user.role) : false,
  };
}
