namespace TalentHunt.Application.Enums;

public static class PermissionType
{
    public const string CanViewCandidates = "CanViewCandidates";
    public const string CanManageCandidates = "CanManageCandidates";
    public const string CanViewApplications = "CanViewApplications";
    public const string CanManageApplications = "CanManageApplications";
    public const string CanViewInterviews = "CanViewInterviews";
    public const string CanManageInterviews = "CanManageInterviews";
    public const string CanMakeDecision = "CanMakeDecision";
    public const string CanViewVacancies = "CanViewVacancies";
    public const string CanManageVacancies = "CanManageVacancies";
    public const string CanManageCompetencies = "CanManageCompetencies";
    public const string CanExportDocuments = "CanExportDocuments";

    public static readonly IReadOnlyList<string> All =
    [
        CanViewCandidates,
        CanManageCandidates,
        CanViewApplications,
        CanManageApplications,
        CanViewInterviews,
        CanManageInterviews,
        CanMakeDecision,
        CanViewVacancies,
        CanManageVacancies,
        CanManageCompetencies,
        CanExportDocuments
    ];

    public static readonly IReadOnlyDictionary<string, string> DisplayNames =
        new Dictionary<string, string>
        {
            [CanViewCandidates] = "Просмотр кандидатов",
            [CanManageCandidates] = "Управление кандидатами",
            [CanViewApplications] = "Просмотр откликов",
            [CanManageApplications] = "Управление откликами",
            [CanViewInterviews] = "Просмотр собеседований",
            [CanManageInterviews] = "Управление собеседованиями",
            [CanMakeDecision] = "Вынесение решения",
            [CanViewVacancies] = "Просмотр вакансий",
            [CanManageVacancies] = "Управление вакансиями",
            [CanManageCompetencies] = "Управление компетенциями",
            [CanExportDocuments] = "Экспорт документов"
        };

    public static readonly IReadOnlyList<string> ViewPermissions =
    [
        CanViewCandidates,
        CanViewApplications,
        CanViewInterviews,
        CanViewVacancies
    ];
}
