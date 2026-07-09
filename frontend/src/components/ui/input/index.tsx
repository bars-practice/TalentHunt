import styles from "./styles.module.css";
import { forwardRef, useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(function Input(
  { className, type, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  if (!isPassword) {
    return (
      <input
        ref={ref}
        type={type}
        className={`${styles.input} ${className ?? ""}`.trim()}
        {...props}
      />
    );
  }

  return (
    <div className={styles.passwordWrapper}>
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={`${styles.input} ${styles.passwordInput} ${className ?? ""}`.trim()}
        {...props}
      />
      <button
        type="button"
        className={styles.passwordToggle}
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});

export default Input;
