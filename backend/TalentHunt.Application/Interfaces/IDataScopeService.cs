using TalentHunt.Application.Enums;

namespace TalentHunt.Application.Interfaces;

public interface IDataScopeService
{
    Guid? GetApproverFilter(IReadOnlyList<string> permissions, Guid? userId);

    bool IsScopedApprover(IReadOnlyList<string> permissions);

    bool CanIncludeDeletedRecords(IReadOnlyList<string> permissions);
}
