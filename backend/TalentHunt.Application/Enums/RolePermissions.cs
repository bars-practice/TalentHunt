namespace TalentHunt.Application.Enums;

public static class RolePermissions
{
    public static List<string> GetDefaultPermissions(Role role) => role switch
    {
        Role.HR       => [PermissionType.CanViewResumes, PermissionType.CanEditResumes],
        Role.Approver => [PermissionType.CanApproveResumes, PermissionType.CanRejectResumes],
        Role.Admin    => [PermissionType.CanViewResumes, PermissionType.CanEditResumes,
                          PermissionType.CanApproveResumes, PermissionType.CanRejectResumes],
        _             => []
    };
}
