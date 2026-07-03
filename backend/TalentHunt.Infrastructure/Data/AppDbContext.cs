using Microsoft.EntityFrameworkCore;

namespace TalentHunt.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
}