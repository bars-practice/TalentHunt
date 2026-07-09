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
public class VacanciesController(
    IVacancyService vacancyService,
    IAuditLogService auditLogService,
    IDataScopeService dataScopeService)
    : BaseController(auditLogService)
{
    [HttpGet]
    [RequirePermission(PermissionType.CanViewVacancies)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var approverFilter = dataScopeService.GetApproverFilter(User.GetPermissions(), User.GetUserId());
        var vacancies = await vacancyService.GetAllAsync(
            approverFilter,
            includeDeleted: true,
            cancellationToken);

        return Ok(vacancies);
    }

    [HttpPost]
    [RequirePermission(PermissionType.CanManageVacancies)]
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
        var canManage = User.HasPermission(PermissionType.CanManageVacancies);
        var canRestore = User.HasPermission(PermissionType.CanRestoreVacancies);

        if (!canManage && !canRestore)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Недостаточно прав." });

        if (!canManage && request.IsDeleted != false)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Недостаточно прав для изменения вакансии." });

        var includeDeleted = User.CanIncludeDeletedRecords() || canRestore;

        try
        {
            var vacancy = await vacancyService.UpdateAsync(
                id, request, includeDeleted, canRestore, cancellationToken);
            await LogAsync($"Обновлена вакансия \"{vacancy.Title}\"");
            return Ok(vacancy);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Вакансия не найдена." });
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
    [RequirePermission(PermissionType.CanManageVacancies)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await vacancyService.DeleteAsync(id, User.CanIncludeDeletedRecords(), cancellationToken);
            await LogAsync($"Удалена вакансия с ID {id}");
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Вакансия не найдена." });
        }
    }
}
