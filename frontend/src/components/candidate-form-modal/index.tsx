import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useModal } from "@/providers/ModalProvider";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { PhoneInput } from "@/components/ui/phone-input";
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

interface CandidateFormModalProps {
  onSubmit?: (data: { fullName: string; phone: string; city: string; skills: string; education: string; experience: string; placesOfWork?: string[] }) => Promise<void>;
}

export function CandidateFormModal({ onSubmit }: CandidateFormModalProps) {
  const { closeModal } = useModal();

  const methods = useForm<CandidateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      city: "",
      skills: "",
      education: "",
      experience: "",
      placesOfWork: "",
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = methods;

  const onFormSubmit = async (values: CandidateFormValues) => {
    const placesOfWork = values.placesOfWork
      ? values.placesOfWork.split(",").map(p => p.trim()).filter(p => p.length > 0)
      : undefined;
    await onSubmit({
      fullName: values.fullName,
      phone: values.phone,
      city: values.city,
      skills: values.skills,
      education: values.education,
      experience: values.experience,
      placesOfWork,
    });
    closeModal();
  };

  return (
    <FormProvider {...methods}>
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
                {...register("fullName")}
              />
              <FieldError errors={[errors.fullName]} />
            </FieldContent>
          </Field>

          <PhoneInput name="phone" label="Телефон" placeholder="+7 (999) 123-45-67" />

          <Field>
            <FieldLabel htmlFor="city">Город</FieldLabel>
            <FieldContent>
              <Input
                id="city"
                type="text"
                placeholder="Москва"
                aria-invalid={!!errors.city}
                {...register("city")}
              />
              <FieldError errors={[errors.city]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="skills">Навыки</FieldLabel>
            <FieldContent>
              <Input
                id="skills"
                type="text"
                placeholder="React, TypeScript, Node.js"
                aria-invalid={!!errors.skills}
                {...register("skills")}
              />
              <FieldError errors={[errors.skills]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="education">Образование</FieldLabel>
            <FieldContent>
              <Input
                id="education"
                type="text"
                placeholder="МГТУ им. Баумана, 2020"
                aria-invalid={!!errors.education}
                {...register("education")}
              />
              <FieldError errors={[errors.education]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="experience">Опыт работы</FieldLabel>
            <FieldContent>
              <Input
                id="experience"
                type="text"
                placeholder="5 лет в разработке"
                aria-invalid={!!errors.experience}
                {...register("experience")}
              />
              <FieldError errors={[errors.experience]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="placesOfWork">Места работы (через запятую)</FieldLabel>
            <FieldContent>
              <Input
                id="placesOfWork"
                type="text"
                placeholder="Яндекс, Сбер, Тинькофф"
                aria-invalid={!!errors.placesOfWork}
                {...register("placesOfWork")}
              />
              <FieldError errors={[errors.placesOfWork]} />
            </FieldContent>
          </Field>
        </div>

        <div className={styles.actions}>
          <Button type="submit" variant="primary" className={styles.submitButton} disabled={isSubmitting}>
            Добавить кандидата
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
