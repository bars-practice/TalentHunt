import styles from "./styles.module.css";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { ComponentProps } from "react";

function RadioGroup({ ...props }: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={styles["radio-group"]} {...props} />;
}

function RadioGroupItem({
  className,
  asChild,
  children,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={`${styles["radio-group-item"]} ${className ?? ""}`.trim()}
      asChild={asChild}
      {...props}
    >
      {/* Если используем asChild, отдаем ОДИН дочерний элемент (ваш блок).
        Если обычный режим — рендерим дефолтный индикатор.
      */}
      {asChild ? (
        children
      ) : (
        <>
          {children}
          <RadioGroupPrimitive.Indicator className={styles["radio-group-indicator"]} />
        </>
      )}
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };