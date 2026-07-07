using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.API.Extensions;
using TalentHunt.Application.DTO;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController(
    IApplicationService applicationService,
    IAuditLogService auditLogService) : BaseController(auditLogService)
{
    [HttpGet]
    [Authorize(Roles = "HR,Admin,Approver")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var applications = await applicationService.GetAllAsync(User.IsAdmin(), cancellationToken);
        return Ok(applications);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "HR,Admin,Approver")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var application = await applicationService.GetByIdAsync(id, User.IsAdmin(), cancellationToken);
            return Ok(application);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Отклик не найден." });
        }
    }

    [HttpPost]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreateApplicationRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var application = await applicationService.CreateAsync(request, cancellationToken);
            await LogAsync(
                $"Создан отклик кандидата \"{application.CandidateFullName}\" на вакансию \"{application.VacancyTitle}\"");
            return CreatedAtAction(nameof(GetById), new { id = application.Id }, application);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateApplicationRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var application = await applicationService.UpdateAsync(id, request, User.IsAdmin(), cancellationToken);
            await LogAsync($"Обновлён отклик {id}");
            return Ok(application);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Отклик не найден." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}/decision")]
    [Authorize(Roles = "Approver,Admin")]
    public async Task<IActionResult> Decide(
        Guid id,
        [FromBody] ApplicationDecisionRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized(new { message = "Пользователь не авторизован." });

        try
        {
            var application = await applicationService.DecideAsync(id, request, userId.Value, cancellationToken);
            await LogAsync($"По отклику {id} вынесено решение: {application.Status}");
            return Ok(application);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Отклик не найден." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await applicationService.DeleteAsync(id, User.IsAdmin(), cancellationToken);
            await LogAsync($"Удалён отклик с ID {id}");
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Отклик не найден." });
        }
    }
}
