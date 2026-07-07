using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentHunt.API.Extensions;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "HR,Admin,Approver")]
public class SearchController(IGlobalSearchService globalSearchService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string query,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var role = User.GetRole();
        if (role is null)
            return Unauthorized(new { message = "Пользователь не авторизован." });

        var result = await globalSearchService.SearchAsync(
            query,
            page,
            pageSize,
            role.Value,
            User.GetUserId(),
            cancellationToken);

        return Ok(result);
    }
}
