using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.Application.Services;

public class DataScopeService : IDataScopeService
{
    public Guid? GetApproverFilter(IReadOnlyList<string> permissions, Guid? userId) =>
        IsScopedApprover(permissions) ? userId : null;

    public bool IsScopedApprover(IReadOnlyList<string> permissions) =>
        permissions.Contains(PermissionType.CanMakeDecision)
        && !permissions.Contains(PermissionType.CanManageInterviews);

    public bool CanIncludeDeletedRecords(IReadOnlyList<string> permissions) =>
        permissions.Contains(PermissionType.CanManageUsers);
}
