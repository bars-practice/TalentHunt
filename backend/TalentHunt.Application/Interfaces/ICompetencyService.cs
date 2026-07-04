using TalentHunt.Application.DTO;

namespace TalentHunt.Application.Interfaces;

public interface ICompetencyService
{
    Task<IEnumerable<CompetencyResponse>> GetAllAsync(
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<CompetencyResponse> CreateAsync(CreateCompetencyRequest request, CancellationToken cancellationToken = default);

    Task<CompetencyResponse> UpdateAsync(
        Guid id,
        UpdateCompetencyRequest request,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);
}
