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
public class ApplicationsController(
    IApplicationService applicationService,
    IAuditLogService auditLogService,
    IPdfService pdfService,
    IDataScopeService dataScopeService)
    : BaseController(auditLogService)
{
    [HttpGet]
    [RequirePermission(PermissionType.CanViewApplications)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var approverFilter = dataScopeService.GetApproverFilter(User.GetRole(), User.GetUserId());
        var applications = await applicationService.GetAllAsync(
            approverFilter,
            User.IsPrivilegedUser(),
            cancellationToken);

        return Ok(applications);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission(PermissionType.CanViewApplications)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var approverFilter = dataScopeService.GetApproverFilter(User.GetRole(), User.GetUserId());
            var application = await applicationService.GetByIdAsync(
                id,
                approverFilter,
                User.IsPrivilegedUser(),
                cancellationToken);

            return Ok(application);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Отклик не найден." });
        }
    }

    [HttpPost]
    [RequirePermission(PermissionType.CanManageApplications)]
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
    [RequirePermission(PermissionType.CanManageApplications)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateApplicationRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var application = await applicationService.UpdateAsync(id, request, User.IsPrivilegedUser(), cancellationToken);
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
    [RequirePermission(PermissionType.CanMakeDecision)]
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
            var approverFilter = dataScopeService.GetApproverFilter(User.GetRole(), userId);
            _ = await applicationService.GetByIdAsync(id, approverFilter, cancellationToken: cancellationToken);

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
    [RequirePermission(PermissionType.CanManageApplications)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await applicationService.DeleteAsync(id, User.IsPrivilegedUser(), cancellationToken);
            await LogAsync($"Удалён отклик с ID {id}");
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Отклик не найден." });
        }
    }

    [HttpGet("{id:guid}/invitation")]
    [RequirePermission(PermissionType.CanExportDocuments)]
    public async Task<IActionResult> GetInvitation(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var approverFilter = dataScopeService.GetApproverFilter(User.GetRole(), User.GetUserId());
            _ = await applicationService.GetByIdAsync(id, approverFilter, cancellationToken: cancellationToken);

            var pdf = await pdfService.GenerateInvitationAsync(id, cancellationToken);
            return File(pdf, "application/pdf", $"invitation-{id}.pdf");
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

    [HttpGet("{id:guid}/rejection")]
    [RequirePermission(PermissionType.CanExportDocuments)]
    public async Task<IActionResult> GetRejection(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var approverFilter = dataScopeService.GetApproverFilter(User.GetRole(), User.GetUserId());
            _ = await applicationService.GetByIdAsync(id, approverFilter, cancellationToken: cancellationToken);

            var pdf = await pdfService.GenerateRejectionAsync(id, cancellationToken);
            return File(pdf, "application/pdf", $"rejection-{id}.pdf");
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

    [HttpGet("{id:guid}/protocol")]
    [RequirePermission(PermissionType.CanExportDocuments)]
    public async Task<IActionResult> GetProtocol(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var approverFilter = dataScopeService.GetApproverFilter(User.GetRole(), User.GetUserId());
            _ = await applicationService.GetByIdAsync(id, approverFilter, cancellationToken: cancellationToken);

            var pdf = await pdfService.GenerateInterviewProtocolAsync(id, cancellationToken);
            return File(pdf, "application/pdf", $"protocol-{id}.pdf");
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Интервью не найдено." });
        }
    }
}
