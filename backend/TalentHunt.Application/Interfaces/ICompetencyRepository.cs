using TalentHunt.Application.Entities;

namespace TalentHunt.Application.Interfaces;

public interface ICompetencyRepository
{
    Task<IReadOnlyList<Competency>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<Competency?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Competency>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default);

    Task<bool> NameExistsAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);

    Task<bool> IsUsedInVacanciesAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Competency competency, CancellationToken cancellationToken = default);

    Task UpdateAsync(Competency competency);

    Task DeleteAsync(Competency competency);

    Task SaveAsync(CancellationToken cancellationToken = default);
}
