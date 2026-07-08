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
                .ThenInclude(a => a.Vacancy)
                    .ThenInclude(v => v.VacancyCompetencies)
            .Include(i => i.Interviewer);

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
        {
            query = query.Where(i =>
                i.Application.ApproverId == approverUserId.Value
                && (i.Application.Status == ApplicationStatus.PendingDecision
                    || i.Application.Status == ApplicationStatus.Approved
                    || i.Application.Status == ApplicationStatus.Rejected));
        }

        var interviews = await query
            .OrderByDescending(i => i.ScheduledAt)
            .ThenByDescending(i => i.Id)
            .ToListAsync(cancellationToken);

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

        await AttachCompetenciesAsync([interview], includeDeleted, cancellationToken);
        return interview;
    }

    public async Task<Interview?> GetByApplicationIdAsync(
        Guid applicationId,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var interview = await QueryWithDetails(includeDeleted)
            .FirstOrDefaultAsync(i => i.ApplicationId == applicationId, cancellationToken);

        if (interview is null)
            return null;

        await AttachCompetenciesAsync([interview], includeDeleted, cancellationToken);
        return interview;
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
            .SelectMany(i => i.Application.Vacancy.VacancyCompetencies)
            .Select(vc => vc.CompetencyId)
            .Distinct()
            .ToList();

        if (competencyIds.Count == 0)
            return;

        var competencies = await context.Competencies
            .IncludeDeletedIf(includeDeleted)
            .Where(c => competencyIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, cancellationToken);

        foreach (var link in interviews.SelectMany(i => i.Application.Vacancy.VacancyCompetencies))
        {
            if (competencies.TryGetValue(link.CompetencyId, out var competency))
                link.Competency = competency;
        }
    }
}
