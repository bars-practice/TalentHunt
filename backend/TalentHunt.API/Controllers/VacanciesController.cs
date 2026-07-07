using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.API.Extensions;
using TalentHunt.Application.DTO;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "HR,Admin,Approver")]
public class VacanciesController(IVacancyService vacancyService, IAuditLogService auditLogService)
    : BaseController(auditLogService)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var vacancies = await vacancyService.GetAllAsync(true, cancellationToken);
        return Ok(vacancies);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateVacancyRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var vacancy = await vacancyService.CreateAsync(request, cancellationToken);
            await LogAsync($"Создана вакансия \"{vacancy.Title}\"");
            return CreatedAtAction(nameof(GetAll), new { id = vacancy.Id }, vacancy);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateVacancyRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var vacancy = await vacancyService.UpdateAsync(id, request, User.IsAdmin(), cancellationToken);
            await LogAsync($"Обновлена вакансия \"{vacancy.Title}\"");
            return Ok(vacancy);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Вакансия не найдена." });
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
            await vacancyService.DeleteAsync(id, User.IsAdmin(), cancellationToken);
            await LogAsync($"Удалена вакансия с ID {id}");
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Вакансия не найдена." });
        }
    }
}
