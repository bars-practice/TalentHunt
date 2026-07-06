using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.API.Extensions;
using TalentHunt.Application.DTO;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "HR,Admin")]
public class CompetenciesController(ICompetencyService competencyService, IAuditLogService auditLogService)
    : BaseController(auditLogService)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var competencies = await competencyService.GetAllAsync(User.IsAdmin(), cancellationToken);
        return Ok(competencies);
    }

    [HttpPost]
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
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateCompetencyRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var competency = await competencyService.UpdateAsync(id, request, User.IsAdmin(), cancellationToken);
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
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await competencyService.DeleteAsync(id, User.IsAdmin(), cancellationToken);
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
