import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useModal } from "@/providers/ModalProvider";
import { VacancyLevel } from "@/api/vacancies";
import { usersService } from "@/api/users";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { CompetencyAutocomplete } from "@/components/competency-autocomplete";
import { CompetencyManageModal } from "@/components/competency-manage-modal";
import { ApproverSearchModal } from "@/components/approver-search-modal";
import { competenciesService, type Competency } from "@/api/competencies";
import { User, X } from "lucide-react";
import styles from "./styles.module.css";

const formSchema = z.object({
  title: z.string().trim().min(1, "Введите название вакансии"),
  level: z.nativeEnum(VacancyLevel).optional().refine((val) => val !== undefined, {
    message: "Выберите уровень вакансии",
  }),
  businessUnit: z.string().trim().min(1, "Введите бизнес-юнит"),
  description: z.string().optional(),
  approverId: z.string().min(1, "Выберите подтверждающего"),
  competencyIds: z.array(z.string()).min(1, "Выберите хотя бы одну компетенцию"),
});

type VacancyFormValues = z.infer<typeof formSchema>;

interface VacancyFormModalProps {
  initialData?: {
    title?: string;
    level?: VacancyLevel;
    businessUnit?: string;
    description?: string;
    approverId?: string;
    competencyIds?: string[];
  };
  onSubmit: (data: VacancyFormValues) => void;
  competencies: Competency[];
  onAddNewCompetency?: (name: string) => string | undefined | Promise<string | undefined>;
  onCompetenciesUpdated?: (competencies: Competency[]) => void;
  defaultApprover?: { id: string; fullName: string };
}

export function VacancyFormModal({
  initialData,
  onSubmit,
  competencies,
  onAddNewCompetency,
  onCompetenciesUpdated,
  defaultApprover,
}: VacancyFormModalProps) {
  const { closeModal, openModal } = useModal();
  const isApproverCreate = !initialData && !!defaultApprover;
  const [selectedApprover, setSelectedApprover] = useState<{ id: string; fullName: string } | null>(null);
  const [availableCompetencies, setAvailableCompetencies] = useState<Competency[]>(competencies);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<VacancyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      level: initialData?.level || undefined,
      businessUnit: initialData?.businessUnit || "",
      description: initialData?.description || "",
      approverId: initialData?.approverId || "",
      competencyIds: initialData?.competencyIds || [],
    },
  });

  const selectedCompetencyIds = watch("competencyIds");

  useEffect(() => {
    setAvailableCompetencies(competencies);
  }, [competencies]);

  const refreshCompetencies = async (): Promise<void> => {
    const data = await competenciesService.getAll();
    const active = data.filter((c) => !c.isDeleted);
    setAvailableCompetencies(active);
    onCompetenciesUpdated?.(active);
  };

  useEffect(() => {
    if (initialData?.approverId) {
      usersService.getById(initialData.approverId)
        .then((user) => {
          setSelectedApprover({
            id: user.id,
            fullName: user.fullName
          });
        })
        .catch((err) => {
          console.error("Failed to load approver data:", err);
          setSelectedApprover({
            id: initialData.approverId!,
            fullName: "Ошибка загрузки имени"
          });
        });
    } else if (defaultApprover) {
      setValue("approverId", defaultApprover.id);
      setSelectedApprover(defaultApprover);
    } else {
      setSelectedApprover(null);
    }
  }, [initialData?.approverId, defaultApprover, setValue]);

  const handleAddCompetency = (id: string) => {
    setValue("competencyIds", [...selectedCompetencyIds, id]);
  };

  const handleRemoveCompetency = (id: string) => {
    setValue(
      "competencyIds",
      getValues("competencyIds").filter((cId) => cId !== id)
    );
  };

  const handleOpenCompetencyManage = () => {
    openModal(
      <CompetencyManageModal
        onUpdated={refreshCompetencies}
        onDeleted={handleRemoveCompetency}
      />,
      { title: "Справочник компетенций", width: "560px" }
    );
  };

  const handleOpenApproverSearch = () => {
    openModal(
      <ApproverSearchModal
        onSelectApprover={(approver) => {
          setValue("approverId", approver.id);
          setSelectedApprover(approver);
        }}
      />,
      { title: "Выбрать подтверждающего", width: "600px" }
    );
  };

  const handleRemoveApprover = () => {
    setValue("approverId", "");
    setSelectedApprover(null);
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
                <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v) as VacancyLevel)}>
                  <SelectTrigger id="level" aria-invalid={!!errors.level}>
                    <SelectValue placeholder="Выберите уровень" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={VacancyLevel.Junior.toString()}>Junior</SelectItem>
                    <SelectItem value={VacancyLevel.Middle.toString()}>Middle</SelectItem>
                    <SelectItem value={VacancyLevel.Senior.toString()}>Senior</SelectItem>
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

        <Field>
          <FieldLabel htmlFor="approverId">Подтверждающий</FieldLabel>
          <FieldContent>
            {selectedApprover ? (
              <div className={styles.approverCard}>
                <span className={styles.approverName}>{selectedApprover.fullName}</span>
                {!isApproverCreate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveApprover}
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenApproverSearch}
                className={styles.addApproverButton}
                aria-invalid={!!errors.approverId}
              >
                <User size={16} />
                Добавить подтверждающего
              </Button>
            )}
            <FieldError errors={[errors.approverId]} />
          </FieldContent>
        </Field>

        <CompetencyAutocomplete
          label="Компетенции"
          allCompetencies={availableCompetencies}
          selectedIds={selectedCompetencyIds}
          onAdd={handleAddCompetency}
          onRemove={handleRemoveCompetency}
          onAddNewCompetency={async (name) => {
            const newId = await onAddNewCompetency?.(name);
            if (newId) {
              await refreshCompetencies();
            }
            return newId;
          }}
          onManageClick={handleOpenCompetencyManage}
          error={errors.competencyIds?.message}
          placeholder="Поиск компетенций..."
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" className={styles.submitButton} disabled={isSubmitting}>
          {initialData ? "Сохранить" : "Добавить"}
        </Button>
      </div>
    </form>
  );
}