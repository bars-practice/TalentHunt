using ApplicationEntity = TalentHunt.Application.Entities.Application;

namespace TalentHunt.Application.Interfaces;

public interface IApplicationRepository
{
    Task<IReadOnlyList<ApplicationEntity>> GetAllAsync(
        Guid? approverUserId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<ApplicationEntity?> GetByIdAsync(
        Guid id,
        Guid? approverUserId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<bool> PairExistsAsync(
        Guid candidateId,
        Guid vacancyId,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default);

    Task AddAsync(ApplicationEntity application, CancellationToken cancellationToken = default);

    Task UpdateAsync(ApplicationEntity application);

    Task DeleteAsync(ApplicationEntity application);

    Task SaveAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ApplicationEntity>> SearchForGlobalByCandidateAsync(
        string query,
        Guid? approverId,
        CancellationToken cancellationToken = default);
}
