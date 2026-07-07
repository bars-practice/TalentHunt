using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.API.Extensions;
using TalentHunt.Application.DTO;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "HR,Admin")]
public class InterviewsController(IInterviewService interviewService, IAuditLogService auditLogService)
    : BaseController(auditLogService)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? candidateId,
        [FromQuery] Guid? vacancyId,
        [FromQuery] ApplicationStatus? applicationStatus,
        CancellationToken cancellationToken)
    {
        var interviews = await interviewService.GetAllAsync(
            candidateId,
            vacancyId,
            applicationStatus,
            User.IsAdmin(),
            cancellationToken);

        return Ok(interviews);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var interview = await interviewService.GetByIdAsync(id, User.IsAdmin(), cancellationToken);
            return Ok(interview);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Собеседование не найдено." });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateInterviewRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var interview = await interviewService.CreateAsync(request, cancellationToken);
            await LogAsync($"Создано собеседование {interview.Id} для отклика {interview.ApplicationId}");
            return CreatedAtAction(nameof(GetById), new { id = interview.Id }, interview);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/start")]
    public async Task<IActionResult> Start(Guid id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized(new { message = "Пользователь не авторизован." });

        try
        {
            var interview = await interviewService.StartAsync(id, userId.Value, cancellationToken);
            await LogAsync($"Начато собеседование {id}, интервьюер {User.Identity?.Name}");
            return Ok(interview);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Собеседование не найдено." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateInterviewRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var interview = await interviewService.UpdateAsync(id, request, cancellationToken);
            var action = request.IsDraft ? "черновик" : "отправка на решение";
            await LogAsync($"Обновлено собеседование {id} ({action})");
            return Ok(interview);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Собеседование не найдено." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
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
            await interviewService.DeleteAsync(id, User.IsAdmin(), cancellationToken);
            await LogAsync($"Удалено собеседование {id}");
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Собеседование не найдено." });
        }
    }
}
