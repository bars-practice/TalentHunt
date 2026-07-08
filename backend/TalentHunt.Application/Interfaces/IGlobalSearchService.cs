using TalentHunt.Application.DTO;
using TalentHunt.Application.Enums;

namespace TalentHunt.Application.Interfaces;

public interface IGlobalSearchService
{
    Task<GlobalSearchResponse> SearchAsync(
        string? query,
        int page,
        int pageSize,
        Role callerRole,
        Guid? callerUserId,
        IReadOnlyList<int>? levels = null,
        IReadOnlyList<int>? candidateStatuses = null,
        string? city = null,
        string? vacancyStatus = null,
        CancellationToken cancellationToken = default);
}
