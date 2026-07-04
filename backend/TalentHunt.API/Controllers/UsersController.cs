using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.Application.DTO;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController(IUserService userService) : ControllerBase
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
        try
        {
            var user = await userService.CreateAsync(request);
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
        try
        {
            var user = await userService.UpdateAsync(id, request);
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
        try
        {
            await userService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Пользователь не найден." });
        }
    }

    [HttpGet("permissions")]
    public IActionResult GetPermissions()
    {
        var permissions = new[]
        {
            new { name = "CanViewResumes",    displayName = "Просмотр резюме"       },
            new { name = "CanEditResumes",    displayName = "Редактирование резюме" },
            new { name = "CanApproveResumes", displayName = "Одобрение резюме"      },
            new { name = "CanRejectResumes",  displayName = "Отклонение резюме"     },
        };
        return Ok(permissions);
    }
}
