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
public class CandidatesController(
    ICandidateService candidateService,
    IAuditLogService auditLogService,
    IPdfService pdfService)
    : BaseController(auditLogService)
{
    [HttpGet]
    [RequirePermission(PermissionType.CanViewCandidates)]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? excludeVacancyId,
        CancellationToken cancellationToken)
    {
        var includeDeleted = !excludeVacancyId.HasValue;
        var candidates = await candidateService.GetAllAsync(
            includeDeleted,
            excludeVacancyId,
            cancellationToken);

        return Ok(candidates);
    }

    [HttpGet("search")]
    [RequirePermission(PermissionType.CanViewCandidates)]
    public async Task<IActionResult> Search(
        [FromQuery] string query,
        [FromQuery] Guid? excludeVacancyId,
        CancellationToken cancellationToken)
    {
        var includeDeleted = !excludeVacancyId.HasValue;
        var results = await candidateService.SearchAsync(query, excludeVacancyId, includeDeleted, cancellationToken);
        return Ok(results);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission(PermissionType.CanViewCandidates)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var candidate = await candidateService.GetByIdAsync(id, includeDeleted: true, cancellationToken);
            return Ok(candidate);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Кандидат не найден." });
        }
    }

    [HttpPost]
    [RequirePermission(PermissionType.CanManageCandidates)]
    public async Task<IActionResult> Create(
        [FromBody] CreateCandidateRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var candidate = await candidateService.CreateAsync(request, cancellationToken);
            await LogAsync($"Создан кандидат \"{candidate.FullName}\"");
            return CreatedAtAction(nameof(GetById), new { id = candidate.Id }, candidate);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [RequirePermission(PermissionType.CanManageCandidates)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateCandidateRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var candidate = await candidateService.UpdateAsync(id, request, User.CanIncludeDeletedRecords(), cancellationToken);
            await LogAsync($"Обновлён кандидат \"{candidate.FullName}\"");
            return Ok(candidate);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Кандидат не найден." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [RequireAnyPermission(PermissionType.CanManageCandidates, PermissionType.CanManageUsers)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await candidateService.DeleteAsync(id, User.CanIncludeDeletedRecords(), cancellationToken);
            await LogAsync($"Заблокирован кандидат с ID {id}");
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Кандидат не найден." });
        }
    }

    [HttpPut("{id:guid}/restore")]
    [RequirePermission(PermissionType.CanRestoreCandidates)]
    public async Task<IActionResult> Restore(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var candidate = await candidateService.UpdateAsync(
                id,
                new UpdateCandidateRequest(IsDeleted: false),
                includeDeleted: true,
                cancellationToken);
            await LogAsync($"Восстановлен кандидат \"{candidate.FullName}\"");
            return Ok(candidate);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Кандидат не найден." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:guid}/card")]
    [RequirePermission(PermissionType.CanExportDocuments)]
    public async Task<IActionResult> GetCard(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var pdf = await pdfService.GenerateCandidateCardAsync(id, cancellationToken);
            return File(pdf, "application/pdf", $"candidate-card-{id}.pdf");
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Кандидат не найден." });
        }
    }
}
