using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace TalentHunt.API.Extensions;

public static class ControllerExtensions
{
    public static bool IsAdmin(this ClaimsPrincipal user) =>
        user.IsInRole("Admin");

    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var id) ? id : null;
    }
}
