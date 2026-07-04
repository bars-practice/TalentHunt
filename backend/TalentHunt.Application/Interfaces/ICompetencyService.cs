using TalentHunt.Application.DTO;

namespace TalentHunt.Application.Interfaces;

public interface ICompetencyService
{
    Task<IEnumerable<CompetencyResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<CompetencyResponse> CreateAsync(CreateCompetencyRequest request, CancellationToken cancellationToken = default);

    Task<CompetencyResponse> UpdateAsync(Guid id, UpdateCompetencyRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
