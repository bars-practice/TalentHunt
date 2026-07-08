import { Users, Calendar, Briefcase, User as UserIcon, FileText, CheckSquare, type LucideIcon } from "lucide-react";
import { Role } from "@/api/auth";
import { Permission, type Permission as PermissionType } from "@/utils/permissions";

export interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
  permission?: PermissionType;
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
    path: "/competency-assessment",
    label: "Оценка компетенций",
    icon: CheckSquare,
    permission: Permission.CanManageCompetencies,
  },
  {
    path: "/users",
    label: "Пользователи",
    icon: Users,
    roles: [Role.Admin, Role.SuperAdmin],
  },
  {
    path: "/audit-log",
    label: "Журнал аудита",
    icon: FileText,
    roles: [Role.Admin, Role.SuperAdmin],
  },
];
