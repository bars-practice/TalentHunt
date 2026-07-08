using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.API.DTO;
using TalentHunt.API.Extensions;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await authService.LoginAsync(request.Login, request.Password, cancellationToken);
        if (user is null)
            return Unauthorized(new { message = "Неверный логин или пароль." });

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Login),
            new("FullName", user.FullName),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        claims.AddRange(user.UserPermissions.Select(up => new Claim("permission", up.Permission.Name)));

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(8)
            });

        return Ok(new
        {
            login = user.Login,
            role = user.Role.ToString(),
            permissions = user.UserPermissions.Select(up => up.Permission.Name).ToList()
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            fullName = User.FindFirst("FullName")?.Value,
            login = User.Identity?.Name,
            role = User.FindFirst(ClaimTypes.Role)?.Value,
            permissions = User.GetPermissions()
        });
    }
}
