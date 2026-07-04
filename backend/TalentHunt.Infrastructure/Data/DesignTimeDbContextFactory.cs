using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TalentHunt.Infrastructure.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var connectionString = args.Length > 0
            ? args[0]
            : "Host=localhost;Port=5432;Database=TalentHunt;Username=postgres;Password=postgres";

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new AppDbContext(optionsBuilder.Options);
    }
}
