using Microsoft.EntityFrameworkCore;
using TalentHunt.Application.Entities;

namespace TalentHunt.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserPermission> UserPermissions => Set<UserPermission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        modelBuilder.Entity<Permission>(b =>
        {
            b.HasKey(p => p.Id);
            b.Property(p => p.Name).IsRequired().HasMaxLength(100);
            b.HasIndex(p => p.Name).IsUnique();
            b.Property(p => p.DisplayName).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<UserPermission>(b =>
        {
            b.HasKey(up => new { up.UserId, up.PermissionId });

            b.HasOne(up => up.User)
             .WithMany(u => u.UserPermissions)
             .HasForeignKey(up => up.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(up => up.Permission)
             .WithMany()
             .HasForeignKey(up => up.PermissionId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
