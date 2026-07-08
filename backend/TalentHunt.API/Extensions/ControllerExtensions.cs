using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.Application.Enums;

namespace TalentHunt.API.Extensions;

public static class ControllerExtensions
{
    public static bool IsPrivilegedUser(this ClaimsPrincipal user) =>
        user.IsInRole(nameof(Role.Admin)) || user.IsInRole(nameof(Role.SuperAdmin));

    public static bool IsAdmin(this ClaimsPrincipal user) =>
        user.IsPrivilegedUser();

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

    public static bool HasPermission(this ClaimsPrincipal user, string permission) =>
        user.IsPrivilegedUser() || user.HasClaim("permission", permission);

    public static IReadOnlyList<string> GetPermissions(this ClaimsPrincipal user) =>
        user.FindAll("permission").Select(c => c.Value).Distinct().ToList();
}
