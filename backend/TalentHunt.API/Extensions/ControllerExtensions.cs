using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.Application.Enums;

namespace TalentHunt.API.Extensions;

public static class ControllerExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var id) ? id : null;
    }

    public static Role? GetRole(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.Role);
        return Enum.TryParse<Role>(value, out var role) ? role : null;
    }

    public static IReadOnlyList<string> GetPermissions(this ClaimsPrincipal user) =>
        user.FindAll("permission").Select(c => c.Value).Distinct().ToList();

    public static bool HasPermission(this ClaimsPrincipal user, string permission) =>
        user.HasClaim("permission", permission);

    public static bool CanIncludeDeletedRecords(this ClaimsPrincipal user) =>
        user.HasPermission(PermissionType.CanManageUsers);
}
