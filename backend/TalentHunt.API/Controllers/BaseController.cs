using Microsoft.AspNetCore.Mvc;
using TalentHunt.Application.DTO;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

public abstract class BaseController(IAuditLogService auditLogService) : ControllerBase
{
    protected Task LogAsync(string action) =>
    auditLogService.CreateAsync(new CreateAuditLogRequest(
        User: User.Identity?.Name ?? "unknown",
        IpAddress: HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        Action: action
    ));
}