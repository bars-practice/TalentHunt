using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.API.Authorization;
using TalentHunt.API.Extensions;
using TalentHunt.Application.DTO;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(IUserService userService, IAuditLogService auditLogService)
    : BaseController(auditLogService)
{
    [HttpGet]
    [RequirePermission(PermissionType.CanManageUsers)]
    public async Task<IActionResult> GetAll()
    {
        var users = await userService.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("search")]
    [RequireAnyPermission(PermissionType.CanManageUsers, PermissionType.CanManageVacancies)]
    public async Task<IActionResult> SearchByRole(
        [FromQuery] string role,
        [FromQuery] string? query,
        CancellationToken cancellationToken)
    {
        var results = await userService.SearchByRoleAsync(role, query, cancellationToken);
        return Ok(results);
    }

    [HttpGet("{id:guid}")]
    [RequireAnyPermission(PermissionType.CanManageUsers, PermissionType.CanManageVacancies)]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var user = await userService.GetByIdAsync(id);
            return Ok(user);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Пользователь не найден." });
        }
    }

    [HttpPost]
    [RequirePermission(PermissionType.CanManageUsers)]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var caller = GetCallerContext();
        if (caller is null)
            return Unauthorized(new { message = "Пользователь не авторизован." });

        try
        {
            var user = await userService.CreateAsync(request, caller);
            await LogAsync($"Создан пользователь: {user.Login} с ролью: {user.Role}");
            return CreatedAtAction(nameof(GetAll), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [RequirePermission(PermissionType.CanManageUsers)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
    {
        var caller = GetCallerContext();
        if (caller is null)
            return Unauthorized(new { message = "Пользователь не авторизован." });

        try
        {
            var user = await userService.UpdateAsync(id, request, caller);
            await LogAsync($"Обновлён пользователь {user.Login}");
            return Ok(user);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Пользователь не найден." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission(PermissionType.CanManageUsers)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var caller = GetCallerContext();
        if (caller is null)
            return Unauthorized(new { message = "Пользователь не авторизован." });

        try
        {
            await userService.DeleteAsync(id, caller);
            await LogAsync($"Удалён пользователь с ID {id}");
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Пользователь не найден." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("permissions")]
    [RequirePermission(PermissionType.CanManageUsers)]
    public IActionResult GetPermissions()
    {
        var permissions = PermissionType.All
            .Select(name => new
            {
                name,
                displayName = PermissionType.DisplayNames[name]
            });

        return Ok(permissions);
    }

    private UserOperationContext? GetCallerContext()
    {
        var userId = User.GetUserId();
        var role = User.GetRole();
        return userId is null || role is null ? null : new UserOperationContext(userId.Value, role.Value);
    }
}
