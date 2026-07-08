import { Users, Calendar, Briefcase, User as UserIcon, FileText, type LucideIcon } from "lucide-react";
import { Role } from "@/api/auth";

export interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

export const menuItems: MenuItem[] = [
  {
    path: "/candidates",
    label: "Кандидаты",
    icon: UserIcon,
    roles: [Role.HR, Role.Approver, Role.Admin, Role.SuperAdmin],
  },
  {
    path: "/interviews",
    label: "Собеседования",
    icon: Calendar,
    roles: [Role.HR, Role.Approver, Role.Admin, Role.SuperAdmin],
  },
  {
    path: "/vacancies",
    label: "Вакансии",
    icon: Briefcase,
    roles: [Role.HR, Role.Approver, Role.Admin, Role.SuperAdmin],
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
