using Microsoft.EntityFrameworkCore;
using TalentHunt.Application.Entities;

namespace TalentHunt.Infrastructure.Extensions;

public static class SoftDeleteQueryExtensions
{
    public static IQueryable<T> IncludeDeletedIf<T>(this IQueryable<T> query, bool includeDeleted)
        where T : class, ISoftDeletable =>
        includeDeleted ? query.IgnoreQueryFilters() : query;
}
