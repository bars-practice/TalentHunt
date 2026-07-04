using Microsoft.EntityFrameworkCore;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Interfaces;
using TalentHunt.Infrastructure.Data;

namespace TalentHunt.Infrastructure.Repositories;

public class CompetencyRepository(AppDbContext context) : ICompetencyRepository
{
    public async Task<IReadOnlyList<Competency>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await context.Competencies
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

    public async Task<Competency?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await context.Competencies
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Competency>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken cancellationToken = default)
    {
        var idList = ids.Distinct().ToList();

        return await context.Competencies
            .Where(c => idList.Contains(c.Id))
            .ToListAsync(cancellationToken);
    }

    public Task<bool> NameExistsAsync(
        string name,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default) =>
        excludeId.HasValue
            ? context.Competencies.AnyAsync(c => c.Name == name && c.Id != excludeId.Value, cancellationToken)
            : context.Competencies.AnyAsync(c => c.Name == name, cancellationToken);

    public Task<bool> IsUsedInVacanciesAsync(Guid id, CancellationToken cancellationToken = default) =>
        context.VacancyCompetencies.AnyAsync(vc => vc.CompetencyId == id, cancellationToken);

    public Task AddAsync(Competency competency, CancellationToken cancellationToken = default) =>
        context.Competencies.AddAsync(competency, cancellationToken).AsTask();

    public Task UpdateAsync(Competency competency)
    {
        context.Competencies.Update(competency);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Competency competency)
    {
        context.Competencies.Remove(competency);
        return Task.CompletedTask;
    }

    public Task SaveAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);
}
