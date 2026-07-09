using Microsoft.EntityFrameworkCore;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Enums;
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
            .Include(a => a.DecidedBy)
            .Include(a => a.Interview)
            .Include(a => a.Approver);

    private async Task AttachVacanciesAsync(
        IReadOnlyList<ApplicationEntity> applications,
        CancellationToken cancellationToken = default)
    {
        var vacancyIds = applications
            .Select(a => a.VacancyId)
            .Distinct()
            .ToList();

        if (vacancyIds.Count == 0)
            return;

        var vacancies = await context.Vacancies
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(v => v.VacancyCompetencies)
            .Where(v => vacancyIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, cancellationToken);

        foreach (var application in applications)
        {
            if (!vacancies.TryGetValue(application.VacancyId, out var vacancy))
                continue;

            // Навигацию заполняем только у detached-сущностей: иначе EF прикрепит
            // весь граф вакансии и попытается вставить VacancyCompetencies заново.
            if (context.Entry(application).State == EntityState.Detached)
                application.Vacancy = vacancy;
        }
    }

    public async Task<IReadOnlyList<ApplicationEntity>> GetAllAsync(
        Guid? approverUserId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var query = QueryWithDetails(includeDeleted).AsNoTracking();

        if (approverUserId.HasValue)
            query = query.Where(a => a.ApproverId == approverUserId.Value);

        query = query.Where(a => context.Candidates
            .IgnoreQueryFilters()
            .Any(c => c.Id == a.CandidateId && !c.IsDeleted));

        var applications = await query
            .OrderByDescending(a => a.Id)
            .ToListAsync(cancellationToken);

        await AttachVacanciesAsync(applications, cancellationToken);
        return applications;
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

        var application = await query.AsNoTracking().FirstOrDefaultAsync(cancellationToken);
        if (application is null)
            return null;

        await AttachVacanciesAsync([application], cancellationToken);
        return application;
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
        context.Entry(application).State = EntityState.Modified;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(ApplicationEntity application)
    {
        application.IsDeleted = true;
        context.Entry(application).State = EntityState.Modified;
        return Task.CompletedTask;
    }

    public Task SaveAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);

    public async Task<IReadOnlyDictionary<Guid, int>> GetActiveCountsByVacancyIdsAsync(
        IReadOnlyCollection<Guid> vacancyIds,
        CancellationToken cancellationToken = default)
    {
        if (vacancyIds.Count == 0)
            return new Dictionary<Guid, int>();

        return await context.Applications
            .AsNoTracking()
            .Where(a => vacancyIds.Contains(a.VacancyId) && !a.IsDeleted)
            .Where(a => context.Candidates
                .IgnoreQueryFilters()
                .Any(c => c.Id == a.CandidateId && !c.IsDeleted))
            .GroupBy(a => a.VacancyId)
            .Select(g => new { VacancyId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.VacancyId, x => x.Count, cancellationToken);
    }

    public async Task<IReadOnlyList<ApplicationEntity>> SearchForGlobalByCandidateAsync(
        string query,
        Guid? approverId,
        IReadOnlyList<int>? candidateStatuses = null,
        string? city = null,
        CancellationToken cancellationToken = default)
    {
        var pattern = $"%{query}%";

        var applicationQuery = context.Applications
            .AsNoTracking()
            .Include(a => a.Candidate)
            .Include(a => a.Interview)
            .Where(a => EF.Functions.ILike(a.Candidate.FullName, pattern))
            .Where(a => !a.Candidate.IsDeleted);

        if (approverId.HasValue)
        {
            applicationQuery = applicationQuery.Where(a =>
                context.Vacancies
                    .IgnoreQueryFilters()
                    .Any(v => v.Id == a.VacancyId && v.ApproverId == approverId.Value));
        }

        if (candidateStatuses is { Count: > 0 })
        {
            var statusEnums = candidateStatuses
                .Where(s => Enum.IsDefined(typeof(ApplicationStatus), s))
                .Select(s => (ApplicationStatus)s)
                .ToList();

            if (statusEnums.Count > 0)
                applicationQuery = applicationQuery.Where(a => statusEnums.Contains(a.Status));
        }

        if (!string.IsNullOrWhiteSpace(city))
            applicationQuery = applicationQuery.Where(a => EF.Functions.ILike(a.Candidate.City, $"%{city.Trim()}%"));

        return await applicationQuery.ToListAsync(cancellationToken);
    }
}
