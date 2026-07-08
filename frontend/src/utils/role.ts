import { Role } from "@/api/auth";

const ROLE_LABELS: Record<Role, string> = {
  [Role.Admin]: "Администратор",
  [Role.HR]: "HR",
  [Role.Approver]: "Approver",
  [Role.SuperAdmin]: "SuperAdmin",
};

export const getRoleLabel = (role: Role): string => {
  return ROLE_LABELS[role] ?? "Пользователь";
};