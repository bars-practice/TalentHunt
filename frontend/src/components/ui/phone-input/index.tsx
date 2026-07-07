import { useFormContext } from "react-hook-form";
import Input from "@/components/ui/input";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";

interface PhoneInputProps {
  name: string;
  label: string;
  placeholder?: string;
}

const formatPhoneNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 0) return "";

  const digits = cleaned.slice(0, 11);
  const firstDigit = digits[0];
  const restDigits = digits.slice(1);

  if (restDigits.length === 0) return `+${firstDigit}`;
  if (restDigits.length <= 3) return `+${firstDigit} (${restDigits}`;
  if (restDigits.length <= 6) return `+${firstDigit} (${restDigits.slice(0, 3)}) ${restDigits.slice(3)}`;
  if (restDigits.length <= 8) return `+${firstDigit} (${restDigits.slice(0, 3)}) ${restDigits.slice(3, 6)} ${restDigits.slice(6)}`;

  return `+${firstDigit} (${restDigits.slice(0, 3)}) ${restDigits.slice(3, 6)} ${restDigits.slice(6, 8)}-${restDigits.slice(8, 10)}`;
};

export function PhoneInput({ name, label, placeholder = "+7 (999) 123 45-67" }: PhoneInputProps) {
  const { register, formState: { errors } } = useFormContext();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = formatPhoneNumber(e.target.value);
  };

  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FieldContent>
        <Input
          id={name}
          type="tel"
          placeholder={placeholder}
          aria-invalid={!!errors[name]}
          {...register(name, {
            onChange: handlePhoneChange
          })}
        />
        <FieldError errors={[errors[name]]} />
      </FieldContent>
    </Field>
  );
}