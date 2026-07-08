using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.Application.Services;

public class DataScopeService : IDataScopeService
{
    public Guid? GetApproverFilter(Role? role, Guid? userId) =>
        role == Role.Approver ? userId : null;

    public bool BypassesDataScope(Role? role) =>
        role is Role.Admin or Role.SuperAdmin;
}
