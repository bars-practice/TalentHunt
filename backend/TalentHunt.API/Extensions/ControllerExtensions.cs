using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace TalentHunt.API.Extensions;

public static class ControllerExtensions
{
    public static bool IsAdmin(this ClaimsPrincipal user) =>
        user.IsInRole("Admin");
}
