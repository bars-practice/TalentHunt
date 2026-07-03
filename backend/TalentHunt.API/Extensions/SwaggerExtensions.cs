using Microsoft.OpenApi;

namespace TalentHunt.API.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "TalentHunt API",
                Version = "v1",
                Description = """
                    Cookie auth: выполните POST /auth/login.
                    Браузер сохранит cookie `auth`, после этого защищённые endpoint'ы будут работать автоматически.
                    """
            });
        });

        return services;
    }

    public static WebApplication UseSwaggerDocumentation(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
            return app;

        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "TalentHunt API v1");
        });

        return app;
    }
}
