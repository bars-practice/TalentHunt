using Microsoft.AspNetCore.Authorization;

namespace TalentHunt.API.Authorization;

public sealed class PermissionRequirement(string permission) : IAuthorizationRequirement
{
    public string Permission { get; } = permission;
}
