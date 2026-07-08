using TalentHunt.Application.DTO;
using TalentHunt.Application.Enums;

namespace TalentHunt.Application.Interfaces;

public interface IGlobalSearchService
{
    Task<GlobalSearchResponse> SearchAsync(
        string query,
        int page,
        int pageSize,
        Role callerRole,
        Guid? callerUserId,
        CancellationToken cancellationToken = default);
}
