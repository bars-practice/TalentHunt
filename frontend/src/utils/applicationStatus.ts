export type StatusBadgeVariant = "success" | "successLight" | "neutral" | "danger" | "warning" | "info";

export interface ApplicationStatusInfo {
  text: string;
  variant: StatusBadgeVariant;
}

export function parseApplicationStatus(status: string | number): number {
  if (typeof status === "number") return status;
  const map: Record<string, number> = {
    Applied: 0,
    InProgress: 1,
    PendingDecision: 2,
    Approved: 3,
    Rejected: 4,
  };
  return map[status] ?? 0;
}

export function getApplicationStatusInfo(status: string | number): ApplicationStatusInfo {
  switch (parseApplicationStatus(status)) {
    case 0:
      return { text: "Новый", variant: "info" };
    case 1:
      return { text: "Ожидает собеседования", variant: "warning" };
    case 2:
      return { text: "Ожидает решения", variant: "successLight" };
    case 3:
      return { text: "Принят", variant: "success" };
    case 4:
      return { text: "Отклонен", variant: "danger" };
    default:
      return { text: "Неизвестно", variant: "neutral" };
  }
}
