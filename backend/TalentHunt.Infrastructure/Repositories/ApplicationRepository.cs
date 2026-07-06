using Microsoft.EntityFrameworkCore;
using TalentHunt.Application.Interfaces;
using TalentHunt.Infrastructure.Data;
using TalentHunt.Infrastructure.Extensions;
using ApplicationEntity = TalentHunt.Application.Entities.Application;

namespace TalentHunt.Infrastructure.Repositories;

public class ApplicationRepository(AppDbContext context) : IApplicationRepository
{
    private IQueryable<ApplicationEntity> QueryWithDetails(bool includeDeleted) =>
        context.Applications
            .IncludeDeletedIf(includeDeleted)
            .Include(a => a.Candidate)
            .Include(a => a.Vacancy)
            .Include(a => a.Interview);

    public async Task<IReadOnlyList<ApplicationEntity>> GetAllAsync(
        bool includeDeleted = false,
        CancellationToken cancellationToken = default) =>
        await QueryWithDetails(includeDeleted)
            .AsNoTracking()
            .OrderByDescending(a => a.Id)
            .ToListAsync(cancellationToken);

    public async Task<ApplicationEntity?> GetByIdAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default) =>
        await QueryWithDetails(includeDeleted)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

    public Task<bool> PairExistsAsync(
        Guid candidateId,
        Guid vacancyId,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default) =>
        excludeId.HasValue
            ? context.Applications.AnyAsync(
                a => a.CandidateId == candidateId
                     && a.VacancyId == vacancyId
                     && a.Id != excludeId.Value,
                cancellationToken)
            : context.Applications.AnyAsync(
                a => a.CandidateId == candidateId && a.VacancyId == vacancyId,
                cancellationToken);

    public Task AddAsync(ApplicationEntity application, CancellationToken cancellationToken = default) =>
        context.Applications.AddAsync(application, cancellationToken).AsTask();

    public Task UpdateAsync(ApplicationEntity application)
    {
        context.Applications.Update(application);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(ApplicationEntity application)
    {
        application.IsDeleted = true;
        context.Applications.Update(application);
        return Task.CompletedTask;
    }

    public Task SaveAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);
}
