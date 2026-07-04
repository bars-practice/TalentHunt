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

    public async Task<IReadOnlyList<Competency>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken cancellationToken = default)
    {
        var idList = ids.Distinct().ToList();

        return await context.Competencies
            .Where(c => idList.Contains(c.Id))
            .ToListAsync(cancellationToken);
    }

    public Task SaveAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);
}
