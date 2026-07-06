using Microsoft.EntityFrameworkCore;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Interfaces;
using TalentHunt.Infrastructure.Data;

namespace TalentHunt.Infrastructure.Repositories;

public class AuditLogRepository(AppDbContext context) : IAuditLogRepository
{
    public async Task<IEnumerable<AuditLog>> GetAllAsync() =>
        await context.AuditLogs.OrderByDescending(al => al.Timestamp).AsNoTracking().ToListAsync();

    public async Task<AuditLog?> GetByIdAsync(Guid id) =>
        await context.AuditLogs.FirstOrDefaultAsync(al => al.Id == id);

    public async Task AddAsync(AuditLog auditLog) =>
        await context.AuditLogs.AddAsync(auditLog).AsTask();

    public async Task SaveAsync() =>
        await context.SaveChangesAsync();
}