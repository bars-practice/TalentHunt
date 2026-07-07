using Microsoft.EntityFrameworkCore;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Interfaces;
using TalentHunt.Infrastructure.Data;
using TalentHunt.Infrastructure.Extensions;

namespace TalentHunt.Infrastructure.Repositories;

public class CandidateRepository(AppDbContext context) : ICandidateRepository
{
    public async Task<IReadOnlyList<Candidate>> GetAllAsync(
        bool includeDeleted = false,
        CancellationToken cancellationToken = default) =>
        await context.Candidates
            .IncludeDeletedIf(includeDeleted)
            .AsNoTracking()
            .OrderBy(c => c.FullName)
            .ToListAsync(cancellationToken);

    public async Task<Candidate?> GetByIdAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default) =>
        await context.Candidates
            .IncludeDeletedIf(includeDeleted)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public Task AddAsync(Candidate candidate, CancellationToken cancellationToken = default) =>
        context.Candidates.AddAsync(candidate, cancellationToken).AsTask();

    public Task UpdateAsync(Candidate candidate)
    {
        context.Candidates.Update(candidate);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Candidate candidate)
    {
        candidate.IsDeleted = true;
        context.Candidates.Update(candidate);
        return Task.CompletedTask;
    }

    public Task SaveAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);

    public async Task<IReadOnlyList<Candidate>> SearchAsync(
        string query,
        int limit,
        CancellationToken cancellationToken = default) =>
        await context.Candidates
            .AsNoTracking()
            .Where(c => EF.Functions.ILike(c.FullName, $"%{query}%"))
            .OrderBy(c => c.FullName)
            .Take(limit)
            .ToListAsync(cancellationToken);
}
