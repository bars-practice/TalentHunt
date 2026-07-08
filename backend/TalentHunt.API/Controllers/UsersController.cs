using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.API.Extensions;
using TalentHunt.Application.DTO;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class UsersController(IUserService userService, IAuditLogService auditLogService)
    : BaseController(auditLogService)
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await userService.GetAllAsync();
        return Ok(users);
    }

    [HttpPost]
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
