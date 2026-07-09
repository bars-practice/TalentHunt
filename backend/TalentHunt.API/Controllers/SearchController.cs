using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.API.Authorization;
using TalentHunt.API.Extensions;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SearchController(IGlobalSearchService globalSearchService) : ControllerBase
{
    [HttpGet]
    [RequireAnyPermission(
        PermissionType.CanViewCandidates,
        PermissionType.CanViewApplications,
        PermissionType.CanViewInterviews,
        PermissionType.CanViewVacancies)]
    public async Task<IActionResult> Search(
        [FromQuery] string? query = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int[]? levels = null,
        [FromQuery] int[]? candidateStatuses = null,
        [FromQuery] string? city = null,
        [FromQuery] string? vacancyStatus = null,
        CancellationToken cancellationToken = default)
    {
        var result = await globalSearchService.SearchAsync(
            query,
            page,
            pageSize,
            User.GetPermissions(),
            User.GetUserId(),
            levels,
            candidateStatuses,
            city,
            vacancyStatus,
            cancellationToken);

        return Ok(result);
    }
}
