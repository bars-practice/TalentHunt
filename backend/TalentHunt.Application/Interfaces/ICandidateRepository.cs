using TalentHunt.Application.Entities;

namespace TalentHunt.Application.Interfaces;

public interface ICandidateRepository
{
    Task<IReadOnlyList<Candidate>> GetAllAsync(
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<Candidate?> GetByIdAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task AddAsync(Candidate candidate, CancellationToken cancellationToken = default);

    Task UpdateAsync(Candidate candidate);

    Task DeleteAsync(Candidate candidate);

    Task SaveAsync(CancellationToken cancellationToken = default);
}
