using TalentHunt.Application.DTO;
using TalentHunt.Application.Enums;

namespace TalentHunt.Application.Interfaces;

public interface IInterviewService
{
    Task<IEnumerable<InterviewListItemResponse>> GetAllAsync(
        Guid? candidateId = null,
        Guid? vacancyId = null,
        ApplicationStatus? applicationStatus = null,
        bool includeDeleted = false,
        IReadOnlyList<string>? callerPermissions = null,
        Guid? callerUserId = null,
        CancellationToken cancellationToken = default);

    Task<InterviewDetailResponse> GetByIdAsync(
        Guid id,
        bool includeDeleted = false,
        IReadOnlyList<string>? callerPermissions = null,
        Guid? callerUserId = null,
        CancellationToken cancellationToken = default);

    Task<InterviewDetailResponse> CreateAsync(
        CreateInterviewRequest request,
        CancellationToken cancellationToken = default);

    Task<InterviewDetailResponse> StartAsync(
        Guid id,
        Guid interviewerUserId,
        CancellationToken cancellationToken = default);

    Task<InterviewDetailResponse> UpdateAsync(
        Guid id,
        UpdateInterviewRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<InterviewDetailResponse> ForceSetStatusAsync(
        Guid interviewId,
        ApplicationStatus status,
        CancellationToken cancellationToken = default);
}
