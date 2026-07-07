using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.API.Extensions;
using TalentHunt.Application.DTO;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "HR,Admin")]
public class CandidatesController(ICandidateService candidateService,
    IAuditLogService auditLogService,
    IPdfService pdfService)
    : BaseController(auditLogService)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var candidates = await candidateService.GetAllAsync(User.IsAdmin(), cancellationToken);
        return Ok(candidates);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query, CancellationToken cancellationToken)
    {
        var results = await candidateService.SearchAsync(query, cancellationToken);
        return Ok(results);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var candidate = await candidateService.GetByIdAsync(id, User.IsAdmin(), cancellationToken);
            return Ok(candidate);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Кандидат не найден." });
        }
    }

    [HttpPost]
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
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateCandidateRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var candidate = await candidateService.UpdateAsync(id, request, User.IsAdmin(), cancellationToken);
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
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await candidateService.DeleteAsync(id, User.IsAdmin(), cancellationToken);
            await LogAsync($"Удалён кандидат с ID {id}");
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Кандидат не найден." });
        }
    }

    [HttpGet("{id:guid}/card")]
    [Authorize(Roles = "HR,Approver")] 
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
