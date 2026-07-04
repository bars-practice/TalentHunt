using TalentHunt.Application.Entities;

namespace TalentHunt.Application.Interfaces;

public interface IVacancyRepository
{
    Task<IEnumerable<Vacancy>> GetAllWithCompetenciesAsync(CancellationToken cancellationToken = default);

    Task<Vacancy?> GetByIdWithCompetenciesAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Vacancy vacancy, CancellationToken cancellationToken = default);

    Task UpdateAsync(Vacancy vacancy);

    Task DeleteAsync(Vacancy vacancy);

    Task ReplaceCompetenciesAsync(Guid vacancyId, IEnumerable<Guid> competencyIds, CancellationToken cancellationToken = default);

    Task SaveAsync(CancellationToken cancellationToken = default);
}
