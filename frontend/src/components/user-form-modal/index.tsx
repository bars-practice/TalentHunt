import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useModal } from "@/providers/ModalProvider";
import { Role } from "@/api/auth";
import { getRoleLabel } from "@/utils/role";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import styles from "./styles.module.css";

const createFormSchema = (mode: "create" | "edit") =>
  z.object({
    fullName: z.string().trim().min(1, "Введите ФИО"),
    login: mode === "create" ? z.string().trim().min(1, "Введите логин") : z.string().optional(),
    role: z.nativeEnum(Role),
    password: mode === "create"
      ? z.string().min(6, "Пароль должен быть не менее 6 символов")
      : z.string().optional().or(z.literal("")),
  });

type UserFormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface UserFormModalProps {
  mode?: "create" | "edit";
  initialData?: {
    fullName?: string;
    role?: Role;
  };
  onSubmit: (data: { fullName: string; login?: string; password?: string; role: Role; permissions: string[] }) => Promise<void>;
}

export function UserFormModal({ mode = "create", initialData, onSubmit }: UserFormModalProps) {
  const { closeModal } = useModal();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(createFormSchema(mode)),
    defaultValues: {
      fullName: initialData?.fullName || "",
      login: "",
      role: initialData?.role ?? Role.Recruiter,
      password: "",
    },
  });

  const onFormSubmit = async (values: UserFormValues) => {
    await onSubmit({
      fullName: values.fullName,
      login: values.login,
      role: values.role,
      password: values.password && values.password.length > 0 ? values.password : undefined,
      permissions: [],
    });
    closeModal();
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
              {...register("fullName")}
            />
            <FieldError errors={[errors.fullName]} />
          </FieldContent>
        </Field>

        {mode === "create" && (
          <Field>
            <FieldLabel htmlFor="login">Логин</FieldLabel>
            <FieldContent>
              <Input
                id="login"
                type="text"
                placeholder="Введите логин"
                aria-invalid={!!errors.login}
                autoComplete="new-password"
                {...register("login")}
              />
              <FieldError errors={[errors.login]} />
            </FieldContent>
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="password">Пароль</FieldLabel>
          <FieldContent>
            <Input
              id="password"
              type="password"
              placeholder={mode === "create" ? "Введите пароль пользователя" : "Оставьте пустым, чтобы не менять"}
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
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(Number(value) as Role)}
                >
                  <SelectTrigger id="role" aria-invalid={!!errors.role}>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.Admin.toString()}>{getRoleLabel(Role.Admin)}</SelectItem>
                    <SelectItem value={Role.HrDirector.toString()}>{getRoleLabel(Role.HrDirector)}</SelectItem>
                    <SelectItem value={Role.Recruiter.toString()}>{getRoleLabel(Role.Recruiter)}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.role]} />
          </FieldContent>
        </Field>
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" className={styles.submitButton} disabled={isSubmitting}>
          {mode === "create" ? "Добавить" : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}