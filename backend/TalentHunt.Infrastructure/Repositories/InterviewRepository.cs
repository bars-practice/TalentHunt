using Microsoft.EntityFrameworkCore;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;
using TalentHunt.Infrastructure.Data;
using TalentHunt.Infrastructure.Extensions;

namespace TalentHunt.Infrastructure.Repositories;

public class InterviewRepository(AppDbContext context) : IInterviewRepository
{
    private IQueryable<Interview> QueryWithDetails(bool includeDeleted) =>
        context.Interviews
            .IncludeDeletedIf(includeDeleted)
            .Include(i => i.Application)
                .ThenInclude(a => a.Candidate)
            .Include(i => i.Application)
                .ThenInclude(a => a.Approver)
            .Include(i => i.Interviewer);

    private async Task AttachVacanciesAsync(
        IReadOnlyList<Interview> interviews,
        CancellationToken cancellationToken = default)
    {
        var vacancyIds = interviews
            .Select(i => i.Application.VacancyId)
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

        foreach (var interview in interviews)
        {
            if (vacancies.TryGetValue(interview.Application.VacancyId, out var vacancy))
                interview.Application.Vacancy = vacancy;
        }
    }

    public async Task<IReadOnlyList<Interview>> GetAllAsync(
        Guid? candidateId = null,
        Guid? vacancyId = null,
        ApplicationStatus? applicationStatus = null,
        Guid? approverUserId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var query = QueryWithDetails(includeDeleted).AsNoTracking();

        if (candidateId.HasValue)
            query = query.Where(i => i.Application.CandidateId == candidateId.Value);

        if (vacancyId.HasValue)
            query = query.Where(i => i.Application.VacancyId == vacancyId.Value);

        if (applicationStatus.HasValue)
            query = query.Where(i => i.Application.Status == applicationStatus.Value);

        if (approverUserId.HasValue)
            query = query.Where(i => i.Application.ApproverId == approverUserId.Value);

        var interviews = await query
            .OrderByDescending(i => i.ScheduledAt)
            .ThenByDescending(i => i.Id)
            .ToListAsync(cancellationToken);

        await AttachVacanciesAsync(interviews, cancellationToken);
        await AttachCompetenciesAsync(interviews, includeDeleted, cancellationToken);
        return interviews;
    }

    public async Task<Interview?> GetByIdAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var interview = await QueryWithDetails(includeDeleted)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (interview is null)
            return null;

        await AttachVacanciesAsync([interview], cancellationToken);
        await AttachCompetenciesAsync([interview], includeDeleted, cancellationToken);
        return interview;
    }

    public async Task<Interview?> GetByApplicationIdAsync(
        Guid applicationId,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var interviewId = await context.Interviews
            .IncludeDeletedIf(includeDeleted)
            .Where(i => i.ApplicationId == applicationId)
            .Select(i => i.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (interviewId == Guid.Empty)
            return null;

        return await GetByIdAsync(interviewId, includeDeleted, cancellationToken);
    }

    public Task AddAsync(Interview interview, CancellationToken cancellationToken = default) =>
        context.Interviews.AddAsync(interview, cancellationToken).AsTask();

    public Task UpdateAsync(Interview interview)
    {
        context.Interviews.Update(interview);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Interview interview)
    {
        interview.IsDeleted = true;
        context.Interviews.Update(interview);
        return Task.CompletedTask;
    }

    public Task SaveAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);

    private async Task AttachCompetenciesAsync(
        IReadOnlyList<Interview> interviews,
        bool includeDeleted,
        CancellationToken cancellationToken)
    {
        var competencyIds = interviews
            .Where(i => i.Application.Vacancy is not null)
            .SelectMany(i => i.Application.Vacancy!.VacancyCompetencies)
            .Select(vc => vc.CompetencyId)
            .Distinct()
            .ToList();

        if (competencyIds.Count == 0)
            return;

        var competencies = await context.Competencies
            .IncludeDeletedIf(includeDeleted)
            .Where(c => competencyIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, cancellationToken);

        foreach (var link in interviews
                     .Where(i => i.Application.Vacancy is not null)
                     .SelectMany(i => i.Application.Vacancy!.VacancyCompetencies))
        {
            if (competencies.TryGetValue(link.CompetencyId, out var competency))
                link.Competency = competency;
        }
    }
}
