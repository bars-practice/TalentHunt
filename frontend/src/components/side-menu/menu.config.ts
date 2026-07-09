import { Users, Calendar, Briefcase, User as UserIcon, FileText, type LucideIcon } from "lucide-react";
import { Permission, type Permission as PermissionType } from "@/utils/permissions";

export interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  permission: PermissionType;
}

export const menuItems: MenuItem[] = [
  {
    path: "/candidates",
    label: "Кандидаты",
    icon: UserIcon,
    permission: Permission.CanViewCandidates,
  },
  {
    path: "/interviews",
    label: "Собеседования",
    icon: Calendar,
    permission: Permission.CanViewInterviews,
  },
  {
    path: "/vacancies",
    label: "Вакансии",
    icon: Briefcase,
    permission: Permission.CanViewVacancies,
  },
  {
    path: "/users",
    label: "Пользователи",
    icon: Users,
    permission: Permission.CanManageUsers,
  },
  {
    path: "/audit-log",
    label: "Журнал аудита",
    icon: FileText,
    permission: Permission.CanViewAuditLog,
  },
];
