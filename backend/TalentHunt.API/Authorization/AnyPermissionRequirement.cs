using Microsoft.AspNetCore.Authorization;

namespace TalentHunt.API.Authorization;

public sealed class AnyPermissionRequirement(params string[] permissions) : IAuthorizationRequirement
{
    public IReadOnlyList<string> Permissions { get; } = permissions;
}
