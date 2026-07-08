using TalentHunt.Application.Entities;
using TalentHunt.Application.Enums;

namespace TalentHunt.Application.Services;

public static class UserManagementPolicy
{
    public static bool IsAdministrativeRole(Role role) =>
        role is Role.Admin or Role.SuperAdmin;

    public static void ValidateCreate(Role callerRole, Role targetRole)
    {
        if (callerRole == Role.Admin && IsAdministrativeRole(targetRole))
            throw new InvalidOperationException("Администратор может создавать только пользователей HR и Approver.");

        if (callerRole == Role.Admin && targetRole == Role.SuperAdmin)
            throw new InvalidOperationException("Только SuperAdmin может назначать роль SuperAdmin.");

        if (callerRole != Role.SuperAdmin && targetRole == Role.Admin)
            throw new InvalidOperationException("Только SuperAdmin может назначать роль Admin.");
    }

    public static void ValidateUpdate(
        Role callerRole,
        Guid callerId,
        User target,
        Role? requestedRole,
        bool? requestedIsDeleted)
    {
        if (target.Id == callerId && requestedRole.HasValue && requestedRole.Value != target.Role)
            throw new InvalidOperationException("Нельзя изменить собственную роль.");

        if (target.Role == Role.SuperAdmin && (requestedRole.HasValue || requestedIsDeleted == true))
            throw new InvalidOperationException("SuperAdmin нельзя удалить или изменить роль.");

        if (callerRole == Role.Admin)
        {
            if (IsAdministrativeRole(target.Role))
                throw new InvalidOperationException("Администратор не может изменять пользователей Admin и SuperAdmin.");

            if (requestedRole.HasValue && IsAdministrativeRole(requestedRole.Value))
                throw new InvalidOperationException("Администратор может назначать только роли HR и Approver.");
        }

        if (callerRole != Role.SuperAdmin && requestedRole == Role.Admin)
            throw new InvalidOperationException("Только SuperAdmin может назначать роль Admin.");

        if (callerRole != Role.SuperAdmin && requestedRole == Role.SuperAdmin)
            throw new InvalidOperationException("Только SuperAdmin может назначать роль SuperAdmin.");
    }

    public static void ValidateDelete(Role callerRole, Guid callerId, User target)
    {
        if (target.Id == callerId)
            throw new InvalidOperationException("Нельзя удалить собственную учётную запись.");

        if (target.Role == Role.SuperAdmin)
            throw new InvalidOperationException("SuperAdmin нельзя удалить.");

        if (callerRole == Role.Admin && IsAdministrativeRole(target.Role))
            throw new InvalidOperationException("Администратор не может удалять пользователей Admin и SuperAdmin.");
    }

    public static void ValidateRestore(Role callerRole, User target)
    {
        if (target.Role == Role.SuperAdmin)
            throw new InvalidOperationException("SuperAdmin нельзя восстанавливать через архив.");

        if (callerRole == Role.Admin && target.Role == Role.Admin)
            throw new InvalidOperationException("Администратор не может восстанавливать других администраторов.");
    }

    public static void ValidateAdministratorsRemain(int administratorsAfterChange)
    {
        if (administratorsAfterChange < 1)
            throw new InvalidOperationException("В системе должен остаться хотя бы один Admin или SuperAdmin.");
    }
}
