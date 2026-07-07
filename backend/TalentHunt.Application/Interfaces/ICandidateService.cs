using TalentHunt.Application.DTO;

namespace TalentHunt.Application.Interfaces;

public interface ICandidateService
{
    Task<IEnumerable<CandidateResponse>> GetAllAsync(
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<CandidateResponse> GetByIdAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<CandidateResponse> CreateAsync(
        CreateCandidateRequest request,
        CancellationToken cancellationToken = default);

    Task<CandidateResponse> UpdateAsync(
        Guid id,
        UpdateCandidateRequest request,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CandidateSearchResultResponse>> SearchAsync(
        string query,
        CancellationToken cancellationToken = default);
}
