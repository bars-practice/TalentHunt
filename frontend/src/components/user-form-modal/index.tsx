import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { useModal } from "@/providers/ModalProvider";
import { Role, type User } from "@/api/auth";
import { usersService } from "@/api/users";
import { ApiError } from "@/api/client";
import { getRoleLabel } from "@/utils/role";
import {
  getAssignableRoles,
  getAssignablePermissions,
  getDefaultPermissionsForRole,
  isAdministrativeRole,
  type Permission,
} from "@/utils/permissions";
import { UserPermissionsModal } from "@/components/user-permissions-modal";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import styles from "./styles.module.css";

const createFormSchema = (mode: "create" | "edit", isSuperAdminSelf = false) =>
  z.object({
    fullName: z.string().trim().min(1, "Введите ФИО"),
    role: z.nativeEnum(Role),
    password: isSuperAdminSelf
      ? z.string().min(6, "Пароль должен быть не менее 6 символов")
      : mode === "create"
      ? z.string().min(6, "Пароль должен быть не менее 6 символов")
      : z.string().optional().or(z.literal("")),
  });

type UserFormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface UserFormModalProps {
  mode?: "create" | "edit";
  caller: User;
  isSelf?: boolean;
  isSuperAdminSelf?: boolean;
  initialData?: {
    fullName?: string;
    role?: Role;
    permissions?: string[];
  };
  onSubmit: (data: { fullName: string; password?: string; role: Role; permissions: string[] }) => Promise<void>;
}

export function UserFormModal({
  mode = "create",
  caller,
  isSelf = false,
  isSuperAdminSelf = false,
  initialData,
  onSubmit,
}: UserFormModalProps) {
  const { closeModal, openModal } = useModal();
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availablePermissionNames, setAvailablePermissionNames] = useState<ReadonlySet<string>>(new Set());

  const callerRole = caller.role;
  const assignableRoles = getAssignableRoles(callerRole);
  const canChangeRole = !isSelf && assignableRoles.length > 0;
  const initialRole = initialData?.role ?? assignableRoles[0] ?? Role.HR;
  const initialRoleRef = useRef(initialRole);

  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    (initialData?.permissions as Permission[]) ?? getDefaultPermissionsForRole(initialRole)
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(createFormSchema(mode, isSuperAdminSelf)),
    defaultValues: {
      fullName: initialData?.fullName || "",
      role: initialRole,
      password: "",
    },
  });

  const selectedRole = watch("role");
  const canConfigurePermissions = !isAdministrativeRole(selectedRole);
  const assignablePermissions = getAssignablePermissions(caller, availablePermissionNames);

  const filterAssignable = (permissions: Permission[]) =>
    permissions.filter((permission) => assignablePermissions.includes(permission));

  useEffect(() => {
    usersService
      .getPermissions()
      .then((permissions) => {
        setAvailablePermissionNames(new Set(permissions.map((permission) => permission.name)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mode === "create" || selectedRole !== initialRoleRef.current) {
      setSelectedPermissions(filterAssignable(getDefaultPermissionsForRole(selectedRole)));
      setPermissionsError(null);
    }
  }, [selectedRole, mode, availablePermissionNames]);

  const handleOpenPermissions = () => {
    openModal(
      <UserPermissionsModal
        permissions={selectedPermissions}
        caller={caller}
        availablePermissionNames={availablePermissionNames}
        onSave={(permissions) => {
          setSelectedPermissions(permissions);
          setPermissionsError(null);
        }}
      />,
      { title: "Права доступа", width: "480px" }
    );
  };

  const onFormSubmit = async (values: UserFormValues) => {
    setSubmitError(null);

    const permissions = canConfigurePermissions
      ? selectedPermissions
      : getDefaultPermissionsForRole(values.role);

    if (canConfigurePermissions && permissions.length === 0) {
      setPermissionsError("Настройте права доступа");
      return;
    }

    try {
      await onSubmit({
        fullName: values.fullName,
        role: values.role,
        password: values.password && values.password.length > 0 ? values.password : undefined,
        permissions,
      });
      closeModal();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Не удалось сохранить пользователя");
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      <div className={styles.fields}>
        <Field>
          <FieldLabel htmlFor="fullName">ФИО</FieldLabel>
          <FieldContent>
            <Input
              id="fullName"
              type="text"
              placeholder="Иванов Иван Иванович"
              aria-invalid={!!errors.fullName}
              autoComplete="new-password"
              disabled={isSuperAdminSelf}
              {...register("fullName")}
            />
            {isSuperAdminSelf && (
              <p className={styles.hint}>SuperAdmin не может изменить собственное ФИО и логин</p>
            )}
            <FieldError errors={[errors.fullName]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Пароль</FieldLabel>
          <FieldContent>
            <Input
              id="password"
              type="password"
              placeholder={
                mode === "create" || isSuperAdminSelf
                  ? "Введите пароль пользователя"
                  : "Оставьте пустым, чтобы не менять"
              }
              aria-invalid={!!errors.password}
              autoComplete="new-password"
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="role">Роль</FieldLabel>
          <FieldContent>
            <div className={styles.roleRow}>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    value={field.value.toString()}
                    disabled={!canChangeRole}
                    onValueChange={(value) => field.onChange(Number(value) as Role)}
                  >
                    <SelectTrigger id="role" className={styles.roleSelect} aria-invalid={!!errors.role}>
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableRoles.map((role) => (
                        <SelectItem key={role} value={role.toString()}>
                          {getRoleLabel(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <span
                className={!canConfigurePermissions ? styles.permissionsButtonWrapper : undefined}
                title={
                  !canConfigurePermissions
                    ? "У администратора все права назначаются автоматически"
                    : undefined
                }
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={styles.permissionsButton}
                  aria-label="Настроить права доступа"
                  disabled={!canConfigurePermissions}
                  title={canConfigurePermissions ? "Настроить права доступа" : undefined}
                  onClick={handleOpenPermissions}
                >
                  <Settings size={18} />
                </Button>
              </span>
            </div>
            {isSelf && <p className={styles.hint}>Нельзя изменить собственную роль</p>}
            {!isSelf && assignableRoles.length === 0 && (
              <p className={styles.hint}>Нет доступных ролей для назначения</p>
            )}
            {permissionsError && <p className={styles.error}>{permissionsError}</p>}
            <FieldError errors={[errors.role]} />
          </FieldContent>
        </Field>
      </div>

      {submitError && <p className={styles.error}>{submitError}</p>}

      <div className={styles.actions}>
        <Button type="submit" variant="primary" className={styles.submitButton} disabled={isSubmitting}>
          {mode === "create" ? "Добавить" : isSuperAdminSelf ? "Сменить пароль" : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}
