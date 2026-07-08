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
            .Include(a => a.DecidedBy)
            .Include(a => a.Interview);

    public async Task<IReadOnlyList<ApplicationEntity>> GetAllAsync(
        Guid? approverUserId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var query = QueryWithDetails(includeDeleted).AsNoTracking();

        if (approverUserId.HasValue)
            query = query.Where(a => a.ApproverId == approverUserId.Value);

        return await query
            .OrderByDescending(a => a.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<ApplicationEntity?> GetByIdAsync(
        Guid id,
        Guid? approverUserId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var query = QueryWithDetails(includeDeleted).Where(a => a.Id == id);

        if (approverUserId.HasValue)
            query = query.Where(a => a.ApproverId == approverUserId.Value);

        return await query.FirstOrDefaultAsync(cancellationToken);
    }

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

    public async Task<IReadOnlyList<ApplicationEntity>> SearchForGlobalByCandidateAsync(
        string query,
        Guid? approverId,
        CancellationToken cancellationToken = default)
    {
        var pattern = $"%{query}%";

        var applicationQuery = context.Applications
            .AsNoTracking()
            .Include(a => a.Candidate)
            .Where(a => EF.Functions.ILike(a.Candidate.FullName, pattern));

        if (approverId.HasValue)
        {
            applicationQuery = applicationQuery.Where(a =>
                context.Vacancies
                    .IgnoreQueryFilters()
                    .Any(v => v.Id == a.VacancyId && v.ApproverId == approverId.Value));
        }

        return await applicationQuery.ToListAsync(cancellationToken);
    }
}
