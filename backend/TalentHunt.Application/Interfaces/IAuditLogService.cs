using TalentHunt.Application.DTO;

namespace TalentHunt.Application.Interfaces;

public interface IAuditLogService
{
    Task<IEnumerable<AuditLogResponse>> GetAllAsync();
    Task<AuditLogResponse?> GetByIdAsync(Guid id);
    Task<AuditLogResponse> CreateAsync(CreateAuditLogRequest request);
}