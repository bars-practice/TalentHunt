namespace TalentHunt.Application.Enums;

public static class RolePermissions
{
    public static List<string> GetDefaultPermissions(Role role) => role switch
    {
        Role.HR => [
            PermissionType.CanViewCandidates,
            PermissionType.CanManageCandidates,
            PermissionType.CanViewApplications,
            PermissionType.CanManageApplications,
            PermissionType.CanViewInterviews,
            PermissionType.CanViewInterviewSchedule,
            PermissionType.CanManageInterviews,
            PermissionType.CanViewVacancies,
            PermissionType.CanManageVacancies,
            PermissionType.CanManageCompetencies,
            PermissionType.CanExportDocuments
        ],
        Role.Approver => [
            PermissionType.CanViewApplications,
            PermissionType.CanViewInterviews,
            PermissionType.CanViewInterviewSchedule,
            PermissionType.CanViewVacancies,
            PermissionType.CanMakeDecision,
            PermissionType.CanExportDocuments
        ],
        Role.Admin or Role.SuperAdmin => PermissionType.All.ToList(),
        _ => []
    };
}
