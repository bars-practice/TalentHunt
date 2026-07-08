using TalentHunt.Application.Enums;

namespace TalentHunt.Application.Interfaces;

public interface IDataScopeService
{
    Guid? GetApproverFilter(Role? role, Guid? userId);

    bool BypassesDataScope(Role? role);
}
