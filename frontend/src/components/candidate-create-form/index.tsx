import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { PhoneInput } from "@/components/ui/phone-input";
import { candidatesService } from "@/api/candidates";
import { applicationsService } from "@/api/applications";
import styles from "./styles.module.css";

const formSchema = z.object({
  fullName: z.string().trim().min(1, "Введите ФИО"),
  phone: z.string().trim().min(1, "Введите телефон"),
  city: z.string().trim().min(1, "Введите город"),
  skills: z.string().trim().min(1, "Введите навыки"),
  education: z.string().trim().min(1, "Введите образование"),
  experience: z.string().trim().min(1, "Введите опыт работы"),
  placesOfWork: z.string().optional(),
});

type CandidateFormValues = z.infer<typeof formSchema>;

interface CandidateCreateFormProps {
  vacancyId?: string;
  onSubmit?: (data: any) => Promise<void>;
  onSuccess?: () => Promise<void> | void;
  onCancel?: () => void;
}

export function CandidateCreateForm({ vacancyId, onSubmit, onSuccess, onCancel }: CandidateCreateFormProps) {
  const methods = useForm<CandidateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "", phone: "", city: "", skills: "", education: "", experience: "", placesOfWork: "",
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = methods;

  const onFormSubmit = async (values: CandidateFormValues) => {
    const placesOfWork = values.placesOfWork
      ? values.placesOfWork.split(",").map(p => p.trim()).filter(p => p.length > 0)
      : undefined;

    const candidateData = {
      ...values,
      placesOfWork,
    };

    try {
      if (onSubmit) {
        await onSubmit(candidateData);
      } else {
        const candidate = await candidatesService.create(candidateData);
        if (vacancyId) {
          await applicationsService.create({ vacancyId, candidateId: candidate.id });
        }
      }

      if (onSuccess) await onSuccess();
    } catch (err) {
      console.error("Ошибка при сохранении кандидата:", err);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
        <div className={styles.fields}>
          <Field>
            <FieldLabel htmlFor="fullName">ФИО</FieldLabel>
            <FieldContent>
              <Input id="fullName" type="text" placeholder="Иванов Иван Иванович" aria-invalid={!!errors.fullName} {...register("fullName")} />
              <FieldError errors={[errors.fullName]} />
            </FieldContent>
          </Field>

          <PhoneInput name="phone" label="Телефон" placeholder="+7 (999) 123-45-67" />

          <Field>
            <FieldLabel htmlFor="city">Город</FieldLabel>
            <FieldContent>
              <Input id="city" type="text" placeholder="Москва" aria-invalid={!!errors.city} {...register("city")} />
              <FieldError errors={[errors.city]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="skills">Навыки</FieldLabel>
            <FieldContent>
              <Input id="skills" type="text" placeholder="React, TypeScript" aria-invalid={!!errors.skills} {...register("skills")} />
              <FieldError errors={[errors.skills]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="education">Образование</FieldLabel>
            <FieldContent>
              <Input id="education" type="text" placeholder="Высшее" aria-invalid={!!errors.education} {...register("education")} />
              <FieldError errors={[errors.education]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="experience">Опыт работы</FieldLabel>
            <FieldContent>
              <Input id="experience" type="text" placeholder="3 года" aria-invalid={!!errors.experience} {...register("experience")} />
              <FieldError errors={[errors.experience]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="placesOfWork">Места работы (через запятую)</FieldLabel>
            <FieldContent>
              <Input id="placesOfWork" type="text" placeholder="Компании..." aria-invalid={!!errors.placesOfWork} {...register("placesOfWork")} />
              <FieldError errors={[errors.placesOfWork]} />
            </FieldContent>
          </Field>
        </div>

        <div className={styles.actions}>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Отмена
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {vacancyId ? "Создать и привязать" : "Создать"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}