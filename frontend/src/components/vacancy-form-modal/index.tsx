import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useModal } from "@/providers/ModalProvider";
import { VACANCY_LEVEL, type VacancyLevel } from "@/shared/types/vacancy";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { CompetencyAutocomplete, type Competency } from "@/components/competency-autocomplete";
import styles from "./styles.module.css";

const formSchema = z.object({
  title: z.string().trim().min(1, "Введите название вакансии"),
  level: z.nativeEnum(VACANCY_LEVEL).optional().refine((val) => val !== undefined, {
    message: "Выберите уровень вакансии",
  }),
  businessUnit: z.string().trim().min(1, "Введите бизнес-юнит"),
  competencyIds: z.array(z.string()).min(1, "Выберите хотя бы одну компетенцию"),
});

type VacancyFormValues = z.infer<typeof formSchema>;

interface VacancyFormModalProps {
  initialData?: {
    title?: string;
    level?: VacancyLevel;
    businessUnit?: string;
    competencyIds?: string[];
  };
  onSubmit: (data: VacancyFormValues) => void;
  competencies: Competency[];
  onAddNewCompetency?: (name: string) => string | undefined;
}

export function VacancyFormModal({ initialData, onSubmit, competencies, onAddNewCompetency }: VacancyFormModalProps) {
  const { closeModal } = useModal();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VacancyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      level: initialData?.level || undefined,
      businessUnit: initialData?.businessUnit || "",
      competencyIds: initialData?.competencyIds || [],
    },
  });

  const selectedCompetencyIds = watch("competencyIds");

  const handleAddCompetency = (id: string) => {
    setValue("competencyIds", [...selectedCompetencyIds, id]);
  };

  const handleRemoveCompetency = (id: string) => {
    setValue(
      "competencyIds",
      selectedCompetencyIds.filter((cId) => cId !== id)
    );
  };

  const onFormSubmit = (values: VacancyFormValues) => {
    onSubmit(values);
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      <div className={styles.fields}>
        <Field>
          <FieldLabel htmlFor="title">Название вакансии</FieldLabel>
          <FieldContent>
            <Input
              id="title"
              type="text"
              placeholder="Senior Frontend Developer"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            <FieldError errors={[errors.title]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="level">Уровень</FieldLabel>
          <FieldContent>
            <Controller
              control={control}
              name="level"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="level" aria-invalid={!!errors.level}>
                    <SelectValue placeholder="Выберите уровень" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={VACANCY_LEVEL.Junior}>Junior</SelectItem>
                    <SelectItem value={VACANCY_LEVEL.Middle}>Middle</SelectItem>
                    <SelectItem value={VACANCY_LEVEL.Senior}>Senior</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.level]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="businessUnit">Бизнес-юнит</FieldLabel>
          <FieldContent>
            <Input
              id="businessUnit"
              type="text"
              placeholder="Engineering"
              aria-invalid={!!errors.businessUnit}
              {...register("businessUnit")}
            />
            <FieldError errors={[errors.businessUnit]} />
          </FieldContent>
        </Field>

        <CompetencyAutocomplete
          label="Компетенции"
          allCompetencies={competencies}
          selectedIds={selectedCompetencyIds}
          onAdd={handleAddCompetency}
          onRemove={handleRemoveCompetency}
          onAddNewCompetency={onAddNewCompetency}
          error={errors.competencyIds?.message}
          placeholder="Поиск компетенций..."
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" className={styles.submitButton} disabled={isSubmitting}>
          Добавить
        </Button>
      </div>
    </form>
  );
}
