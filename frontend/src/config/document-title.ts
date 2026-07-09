export const APP_NAME = "TalentHunt";

const ROUTE_TITLES: Record<string, string> = {
  "/login": "Вход",
  "/candidates": "Реестр кандидатов",
  "/interviews": "Расписание собеседований",
  "/vacancies": "Реестр вакансий",
  "/users": "Управление пользователями",
  "/audit-log": "Журнал аудита",
};

export function formatDocumentTitle(pageTitle?: string): string {
  if (!pageTitle || pageTitle === APP_NAME) {
    return APP_NAME;
  }

  return `${pageTitle} — ${APP_NAME}`;
}

export function getRouteTitle(pathname: string): string | undefined {
  if (pathname.startsWith("/assessment/")) {
    return "Оценка компетенций";
  }

  return ROUTE_TITLES[pathname];
}
