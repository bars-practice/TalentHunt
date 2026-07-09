import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  hasPermission as checkPermission,
  type Permission,
} from "@/utils/permissions";

export function usePermissions() {
  const { user, loading, logout } = useCurrentUser();

  const hasPermission = (permission: Permission) => checkPermission(user, permission);

  return {
    user,
    loading,
    logout,
    hasPermission,
  };
}
