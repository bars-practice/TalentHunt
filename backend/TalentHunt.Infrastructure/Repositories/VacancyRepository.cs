using Microsoft.EntityFrameworkCore;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Interfaces;
using TalentHunt.Infrastructure.Data;
using TalentHunt.Infrastructure.Extensions;

namespace TalentHunt.Infrastructure.Repositories;

public class VacancyRepository(AppDbContext context) : IVacancyRepository
{
    public async Task<IEnumerable<Vacancy>> GetAllWithCompetenciesAsync(
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var vacancies = await context.Vacancies
            .IncludeDeletedIf(includeDeleted)
            .Include(v => v.VacancyCompetencies)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        await AttachCompetenciesAsync(vacancies, includeDeleted, cancellationToken);
        return vacancies;
    }

    public async Task<Vacancy?> GetByIdWithCompetenciesAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var vacancy = await context.Vacancies
            .IncludeDeletedIf(includeDeleted)
            .Include(v => v.VacancyCompetencies)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

        if (vacancy is null)
            return null;

        await AttachCompetenciesAsync([vacancy], includeDeleted, cancellationToken);
        return vacancy;
    }

    public Task AddAsync(Vacancy vacancy, CancellationToken cancellationToken = default) =>
        context.Vacancies.AddAsync(vacancy, cancellationToken).AsTask();

    public Task UpdateAsync(Vacancy vacancy)
    {
        context.Vacancies.Update(vacancy);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Vacancy vacancy)
    {
        vacancy.IsDeleted = true;
        context.Vacancies.Update(vacancy);
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

    private async Task AttachCompetenciesAsync(
        IReadOnlyList<Vacancy> vacancies,
        bool includeDeleted,
        CancellationToken cancellationToken)
    {
        var competencyIds = vacancies
            .SelectMany(v => v.VacancyCompetencies)
            .Select(vc => vc.CompetencyId)
            .Distinct()
            .ToList();

        if (competencyIds.Count == 0)
            return;

        var competencies = await context.Competencies
            .IncludeDeletedIf(includeDeleted)
            .Where(c => competencyIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, cancellationToken);

        foreach (var link in vacancies.SelectMany(v => v.VacancyCompetencies))
        {
            if (competencies.TryGetValue(link.CompetencyId, out var competency))
                link.Competency = competency;
        }
    }
}
