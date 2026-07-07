namespace TalentHunt.Application.Interfaces;

public interface IPdfService
{
    Task<byte[]> GenerateCandidateCardAsync(Guid candidateId, CancellationToken cancellationToken = default);
    Task<byte[]> GenerateInvitationAsync(Guid applicationId, CancellationToken cancellationToken = default);
    Task<byte[]> GenerateRejectionAsync(Guid applicationId, CancellationToken cancellationToken = default);
    Task<byte[]> GenerateInterviewProtocolAsync(Guid applicationId, CancellationToken cancellationToken = default);

}