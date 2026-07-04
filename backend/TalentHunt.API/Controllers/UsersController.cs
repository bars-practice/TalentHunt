using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.Application.DTO;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>GET /api/users — список всех пользователей</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    /// <summary>POST /api/users — создать HR или Approver</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        try
        {
            var user = await _userService.CreateAsync(request);
            return CreatedAtAction(nameof(GetAll), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>PUT /api/users/{id} — обновить данные / права пользователя</summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
    {
        try
        {
            var user = await _userService.UpdateAsync(id, request);
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

    /// <summary>DELETE /api/users/{id} — удалить пользователя</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _userService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Пользователь не найден." });
        }
    }

    /// <summary>GET /api/users/permissions — список всех доступных прав</summary>
    [HttpGet("permissions")]
    public IActionResult GetPermissions()
    {
        var permissions = new[]
        {
            new { name = "CanViewResumes",    displayName = "Просмотр резюме"      },
            new { name = "CanEditResumes",    displayName = "Редактирование резюме" },
            new { name = "CanApproveResumes", displayName = "Одобрение резюме"     },
            new { name = "CanRejectResumes",  displayName = "Отклонение резюме"    },
        };
        return Ok(permissions);
    }
}
