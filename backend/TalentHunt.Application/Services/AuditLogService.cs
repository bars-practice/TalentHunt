using TalentHunt.Application.DTO;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Interfaces;
using TalentHunt.Application.Utils;

namespace TalentHunt.Application.Services;

public class AuditLogService(IAuditLogRepository repository) : IAuditLogService
{
    public async Task<IEnumerable<AuditLogResponse>> GetAllAsync()
    {
        var logs = await repository.GetAllAsync();
        return logs.Select(ToResponse);
    }
    public async Task<AuditLogResponse?> GetByIdAsync(Guid id)
    {
        var log = await repository.GetByIdAsync(id);
        return log is null ? null : ToResponse(log);
    }

    public async Task<AuditLogResponse> CreateAsync(CreateAuditLogRequest request)
    {
        var log = new AuditLog
        {
            Id = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            User = request.User,
            IpAddress = IpAddressNormalizer.Normalize(request.IpAddress),
            Action = request.Action,
        };
        await repository.AddAsync(log);
        await repository.SaveAsync();
        return ToResponse(log);
    }

    private static AuditLogResponse ToResponse(AuditLog log) => 
    new(
        log.Id,
        log.Timestamp,
        log.User,
        IpAddressNormalizer.Normalize(log.IpAddress),
        log.Action
    );
}