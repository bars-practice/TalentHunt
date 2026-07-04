import styles from "./styles.module.css";
import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?:
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";
  size?: "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg";
  asChild?: boolean;
  loading?: boolean;
};

function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-size={size}
      data-variant={variant}
      data-loading={loading}
      className={`${styles.button} ${className ?? ""}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : children}
    </Comp>
  );
}

export default Button;
