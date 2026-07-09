import { Role, type User } from "@/api/auth";

export const Permission = {
  CanViewCandidates: "CanViewCandidates",
  CanManageCandidates: "CanManageCandidates",
  CanViewApplications: "CanViewApplications",
  CanManageApplications: "CanManageApplications",
  CanViewInterviews: "CanViewInterviews",
  CanManageInterviews: "CanManageInterviews",
  CanMakeDecision: "CanMakeDecision",
  CanViewVacancies: "CanViewVacancies",
  CanManageVacancies: "CanManageVacancies",
  CanRestoreVacancies: "CanRestoreVacancies",
  CanManageCompetencies: "CanManageCompetencies",
  CanExportDocuments: "CanExportDocuments",
  CanManageUsers: "CanManageUsers",
  CanViewAuditLog: "CanViewAuditLog",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.CanViewCandidates]: "Просмотр кандидатов",
  [Permission.CanManageCandidates]: "Управление кандидатами",
  [Permission.CanViewApplications]: "Просмотр откликов",
  [Permission.CanManageApplications]: "Управление откликами",
  [Permission.CanViewInterviews]: "Просмотр собеседований",
  [Permission.CanManageInterviews]: "Управление собеседованиями",
  [Permission.CanMakeDecision]: "Вынесение решения",
  [Permission.CanViewVacancies]: "Просмотр вакансий",
  [Permission.CanManageVacancies]: "Управление вакансиями",
  [Permission.CanRestoreVacancies]: "Восстановление вакансий",
  [Permission.CanManageCompetencies]: "Управление компетенциями",
  [Permission.CanExportDocuments]: "Экспорт документов",
  [Permission.CanManageUsers]: "Управление пользователями",
  [Permission.CanViewAuditLog]: "Просмотр журнала аудита",
};

export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  {
    label: "Кандидаты",
    permissions: [Permission.CanViewCandidates, Permission.CanManageCandidates],
  },
  {
    label: "Отклики",
    permissions: [Permission.CanViewApplications, Permission.CanManageApplications],
  },
  {
    label: "Собеседования",
    permissions: [Permission.CanViewInterviews, Permission.CanManageInterviews],
  },
  {
    label: "Решения",
    permissions: [Permission.CanMakeDecision],
  },
  {
    label: "Вакансии",
    permissions: [
      Permission.CanViewVacancies,
      Permission.CanManageVacancies,
      Permission.CanRestoreVacancies,
    ],
  },
  {
    label: "Компетенции",
    permissions: [Permission.CanManageCompetencies],
  },
  {
    label: "Документы",
    permissions: [Permission.CanExportDocuments],
  },
  {
    label: "Администрирование",
    permissions: [Permission.CanManageUsers, Permission.CanViewAuditLog],
  },
];

export const isAdministrativeRole = (role: Role): boolean =>
  role === Role.Admin || role === Role.SuperAdmin;

export const hasPermission = (user: User | null | undefined, permission: Permission): boolean => {
  if (!user) return false;
  return user.permissions.includes(permission);
};

export const getDefaultPermissionsForRole = (role: Role): Permission[] => {
  switch (role) {
    case Role.HR:
      return [
        Permission.CanViewCandidates,
        Permission.CanManageCandidates,
        Permission.CanViewApplications,
        Permission.CanManageApplications,
        Permission.CanViewInterviews,
        Permission.CanManageInterviews,
        Permission.CanViewVacancies,
        Permission.CanManageVacancies,
        Permission.CanManageCompetencies,
        Permission.CanExportDocuments,
      ];
    case Role.Approver:
      return [
        Permission.CanViewApplications,
        Permission.CanViewInterviews,
        Permission.CanViewVacancies,
        Permission.CanMakeDecision,
        Permission.CanExportDocuments,
      ];
    case Role.Admin:
    case Role.SuperAdmin:
      return Object.values(Permission);
    default:
      return [];
  }
};

export const getAssignableRoles = (callerRole: Role): Role[] => {
  if (callerRole === Role.SuperAdmin) {
    return [Role.Admin, Role.HR, Role.Approver];
  }
  if (callerRole === Role.Admin) {
    return [Role.HR, Role.Approver];
  }
  return [];
};

export const canManageUser = (
  caller: User,
  target: User
): { canEdit: boolean; canDelete: boolean; canRestore: boolean } => {
  if (caller.id === target.id) {
    return { canEdit: true, canDelete: false, canRestore: false };
  }

  if (target.role === Role.SuperAdmin) {
    return { canEdit: false, canDelete: false, canRestore: false };
  }

  if (caller.role === Role.Admin && isAdministrativeRole(target.role)) {
    return { canEdit: false, canDelete: false, canRestore: false };
  }

  return { canEdit: true, canDelete: true, canRestore: true };
};

export const isScopedApprover = (user: User | null | undefined): boolean =>
  !!user
  && hasPermission(user, Permission.CanMakeDecision)
  && !hasPermission(user, Permission.CanManageInterviews);
