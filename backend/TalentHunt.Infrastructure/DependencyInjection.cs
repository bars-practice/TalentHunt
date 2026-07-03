using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TalentHunt.Infrastructure.Data;
using TalentHunt.Infrastructure.Repositories;
using TalentHunt.Infrastructure.Authentication;
using TalentHunt.Application.Interfaces;
using TalentHunt.Application.Services;

namespace TalentHunt.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPasswordHasher, UserPasswordHasher>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}