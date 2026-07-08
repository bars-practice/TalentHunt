using TalentHunt.Application.Entities;

namespace TalentHunt.Application.Interfaces;

public interface IVacancyRepository
{
    Task<IEnumerable<Vacancy>> GetAllWithCompetenciesAsync(
        Guid? approverUserId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<Vacancy?> GetByIdWithCompetenciesAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task AddAsync(Vacancy vacancy, CancellationToken cancellationToken = default);

    Task UpdateAsync(Vacancy vacancy);

    Task DeleteAsync(Vacancy vacancy);

    Task ReplaceCompetenciesAsync(Guid vacancyId, IEnumerable<Guid> competencyIds, CancellationToken cancellationToken = default);

    Task SaveAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Guid>> SearchIdsByTextAsync(
        string query,
        Guid? approverId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Vacancy>> GetByIdsForGlobalSearchAsync(
        IReadOnlyCollection<Guid> ids,
        Guid? approverId,
        CancellationToken cancellationToken = default);
}
