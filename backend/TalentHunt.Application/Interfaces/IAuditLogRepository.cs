using TalentHunt.Application.Entities;

namespace TalentHunt.Application.Interfaces;

public interface IAuditLogRepository
{
    Task<IEnumerable<AuditLog>> GetAllAsync();
    Task<AuditLog?> GetByIdAsync(Guid id);
    Task AddAsync(AuditLog auditLog);
    Task SaveAsync();
}