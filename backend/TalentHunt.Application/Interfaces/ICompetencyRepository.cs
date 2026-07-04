using TalentHunt.Application.Entities;

namespace TalentHunt.Application.Interfaces;

public interface ICompetencyRepository
{
    Task<IReadOnlyList<Competency>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Competency>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default);

    Task SaveAsync(CancellationToken cancellationToken = default);
}
