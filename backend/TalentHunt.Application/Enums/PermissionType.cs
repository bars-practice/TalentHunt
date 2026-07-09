namespace TalentHunt.Application.Enums;

public static class PermissionType
{
    public const string CanViewCandidates = "CanViewCandidates";
    public const string CanManageCandidates = "CanManageCandidates";
    public const string CanRestoreCandidates = "CanRestoreCandidates";
    public const string CanViewApplications = "CanViewApplications";
    public const string CanManageApplications = "CanManageApplications";
    public const string CanViewInterviews = "CanViewInterviews";
    public const string CanViewInterviewSchedule = "CanViewInterviewSchedule";
    public const string CanManageInterviews = "CanManageInterviews";
    public const string CanMakeDecision = "CanMakeDecision";
    public const string CanViewVacancies = "CanViewVacancies";
    public const string CanManageVacancies = "CanManageVacancies";
    public const string CanRestoreVacancies = "CanRestoreVacancies";
    public const string CanManageCompetencies = "CanManageCompetencies";
    public const string CanExportDocuments = "CanExportDocuments";
    public const string CanManageUsers = "CanManageUsers";
    public const string CanViewAuditLog = "CanViewAuditLog";

    public static readonly IReadOnlyList<string> All =
    [
        CanViewCandidates,
        CanManageCandidates,
        CanRestoreCandidates,
        CanViewApplications,
        CanManageApplications,
        CanViewInterviews,
        CanViewInterviewSchedule,
        CanManageInterviews,
        CanMakeDecision,
        CanViewVacancies,
        CanManageVacancies,
        CanRestoreVacancies,
        CanManageCompetencies,
        CanExportDocuments,
        CanManageUsers,
        CanViewAuditLog
    ];

    public static readonly IReadOnlyDictionary<string, string> DisplayNames =
        new Dictionary<string, string>
        {
            [CanViewCandidates] = "Просмотр кандидатов",
            [CanManageCandidates] = "Управление кандидатами",
            [CanRestoreCandidates] = "Восстановление кандидатов",
            [CanViewApplications] = "Просмотр откликов",
            [CanManageApplications] = "Управление откликами",
            [CanViewInterviews] = "Просмотр собеседований",
            [CanViewInterviewSchedule] = "Просмотр расписания",
            [CanManageInterviews] = "Управление собеседованиями",
            [CanMakeDecision] = "Вынесение решения",
            [CanViewVacancies] = "Просмотр вакансий",
            [CanManageVacancies] = "Управление вакансиями",
            [CanRestoreVacancies] = "Восстановление вакансий",
            [CanManageCompetencies] = "Управление компетенциями",
            [CanExportDocuments] = "Экспорт документов",
            [CanManageUsers] = "Управление пользователями",
            [CanViewAuditLog] = "Просмотр журнала аудита"
        };

    public static readonly IReadOnlyList<string> ViewPermissions =
    [
        CanViewCandidates,
        CanViewApplications,
        CanViewInterviews,
        CanViewInterviewSchedule,
        CanViewVacancies
    ];
}
