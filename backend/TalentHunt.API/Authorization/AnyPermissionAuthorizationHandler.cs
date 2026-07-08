using Microsoft.AspNetCore.Authorization;
using TalentHunt.Application.Enums;

namespace TalentHunt.API.Authorization;

public sealed class AnyPermissionAuthorizationHandler : AuthorizationHandler<AnyPermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        AnyPermissionRequirement requirement)
    {
        if (context.User.IsInRole(nameof(Role.SuperAdmin))
            || context.User.IsInRole(nameof(Role.Admin)))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        if (requirement.Permissions.Any(p => context.User.HasClaim("permission", p)))
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}
