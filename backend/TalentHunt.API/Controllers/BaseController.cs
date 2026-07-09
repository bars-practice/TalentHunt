using Microsoft.AspNetCore.Mvc;
using TalentHunt.Application.DTO;
using TalentHunt.Application.Interfaces;
using TalentHunt.Application.Utils;

namespace TalentHunt.API.Controllers;

public abstract class BaseController(IAuditLogService auditLogService) : ControllerBase
{
    protected Task LogAsync(string action) =>
    auditLogService.CreateAsync(new CreateAuditLogRequest(
        User: User.Identity?.Name ?? "unknown",
        IpAddress: IpAddressNormalizer.Normalize(HttpContext.Connection.RemoteIpAddress),
        Action: action
    ));
}