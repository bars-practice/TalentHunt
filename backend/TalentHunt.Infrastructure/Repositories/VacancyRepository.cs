using Microsoft.EntityFrameworkCore;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Interfaces;
using TalentHunt.Infrastructure.Data;

namespace TalentHunt.Infrastructure.Repositories;

public class VacancyRepository(AppDbContext context) : IVacancyRepository
{
    public async Task<IEnumerable<Vacancy>> GetAllWithCompetenciesAsync(CancellationToken cancellationToken = default) =>
        await context.Vacancies
            .Include(v => v.VacancyCompetencies)
            .ThenInclude(vc => vc.Competency)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

    public async Task<Vacancy?> GetByIdWithCompetenciesAsync(Guid id, CancellationToken cancellationToken = default) =>
        await context.Vacancies
            .Include(v => v.VacancyCompetencies)
            .ThenInclude(vc => vc.Competency)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

    public Task AddAsync(Vacancy vacancy, CancellationToken cancellationToken = default) =>
        context.Vacancies.AddAsync(vacancy, cancellationToken).AsTask();

    public Task UpdateAsync(Vacancy vacancy)
    {
        context.Vacancies.Update(vacancy);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Vacancy vacancy)
    {
        context.Vacancies.Remove(vacancy);
        return Task.CompletedTask;
    }

    public async Task ReplaceCompetenciesAsync(
        Guid vacancyId,
        IEnumerable<Guid> competencyIds,
        CancellationToken cancellationToken = default)
    {
        var existing = await context.VacancyCompetencies
            .Where(vc => vc.VacancyId == vacancyId)
            .ToListAsync(cancellationToken);

        context.VacancyCompetencies.RemoveRange(existing);

        var newLinks = competencyIds.Select(competencyId => new VacancyCompetency
        {
            VacancyId = vacancyId,
            CompetencyId = competencyId
        });

        await context.VacancyCompetencies.AddRangeAsync(newLinks, cancellationToken);
    }

    public Task SaveAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);
}
