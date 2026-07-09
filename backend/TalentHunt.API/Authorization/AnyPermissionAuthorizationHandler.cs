using Microsoft.AspNetCore.Authorization;

namespace TalentHunt.API.Authorization;

public sealed class AnyPermissionAuthorizationHandler : AuthorizationHandler<AnyPermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        AnyPermissionRequirement requirement)
    {
        if (requirement.Permissions.Any(p => context.User.HasClaim("permission", p)))
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}
