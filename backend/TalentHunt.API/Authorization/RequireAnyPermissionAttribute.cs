using Microsoft.AspNetCore.Authorization;

namespace TalentHunt.API.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public class RequireAnyPermissionAttribute : AuthorizeAttribute, IAuthorizationRequirementData
{
    public RequireAnyPermissionAttribute(params string[] permissions)
    {
        Permissions = permissions;
    }

    public IReadOnlyList<string> Permissions { get; }

    public IEnumerable<IAuthorizationRequirement> GetRequirements()
    {
        yield return new AnyPermissionRequirement(Permissions.ToArray());
    }
}
