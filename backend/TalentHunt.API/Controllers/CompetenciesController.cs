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
public class CompetenciesController(ICompetencyService competencyService, IAuditLogService auditLogService)
    : BaseController(auditLogService)
{
    [HttpGet]
    [RequireAnyPermission(PermissionType.CanManageCompetencies, PermissionType.CanManageVacancies)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var competencies = await competencyService.GetAllAsync(User.CanIncludeDeletedRecords(), cancellationToken);
        return Ok(competencies);
    }

    [HttpGet("search")]
    [RequireAnyPermission(PermissionType.CanManageCompetencies, PermissionType.CanManageVacancies)]
    public async Task<IActionResult> Search([FromQuery] string query, CancellationToken cancellationToken)
    {
        var results = await competencyService.SearchAsync(query, cancellationToken);
        return Ok(results);
    }

    [HttpPost]
    [RequirePermission(PermissionType.CanManageCompetencies)]
    public async Task<IActionResult> Create(
        [FromBody] CreateCompetencyRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var competency = await competencyService.CreateAsync(request, cancellationToken);
            await LogAsync($"Создана компетенция \"{competency.Name}\"");
            return CreatedAtAction(nameof(GetAll), new { id = competency.Id }, competency);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [RequirePermission(PermissionType.CanManageCompetencies)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateCompetencyRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var competency = await competencyService.UpdateAsync(id, request, User.CanIncludeDeletedRecords(), cancellationToken);
            await LogAsync($"Обновлена компетенция \"{competency.Name}\"");
            return Ok(competency);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Компетенция не найдена." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission(PermissionType.CanManageCompetencies)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await competencyService.DeleteAsync(id, User.CanIncludeDeletedRecords(), cancellationToken);
            await LogAsync($"Удалена компетенция с ID {id}");
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Компетенция не найдена." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
