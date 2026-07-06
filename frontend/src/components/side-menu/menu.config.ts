import { Users, Calendar, Briefcase, User as UserIcon, type LucideIcon } from "lucide-react";
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
    roles: [Role.HrDirector, Role.Recruiter, Role.Admin],
  },
  {
    path: "/interviews",
    label: "Собеседования",
    icon: Calendar,
    roles: [Role.HrDirector, Role.Recruiter, Role.Admin],
  },
  {
    path: "/vacancies",
    label: "Вакансии",
    icon: Briefcase,
    roles: [Role.HrDirector, Role.Recruiter, Role.Admin],
  },
  {
    path: "/users",
    label: "Пользователи",
    icon: Users,
    roles: [Role.Admin],
  },
];