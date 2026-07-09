using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.API.Authorization;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

[ApiController]
[Route("api/audit-logs")]
[Authorize]
[RequirePermission(PermissionType.CanViewAuditLog)]
public class AuditLogController(IAuditLogService auditLogService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await auditLogService.GetAllAsync());
    
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var log = await auditLogService.GetByIdAsync(id);
        return log is null ? NotFound() : Ok(log);
    }
}
