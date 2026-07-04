import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { Field, FieldContent, FieldError } from "@/components/ui/field"
import logoImg from "@/assets/logo.svg"
import styles from "./index.module.css"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authService } from "@/api/auth"
import { ApiError } from "@/api/client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const loginSchema = z.object({
  login: z.string().min(1, "Логин обязателен"),
  password: z.string().min(1, "Пароль обязателен"),
})

type LoginFormValues = z.infer<typeof loginSchema>

function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null)
      await authService.login(data)
      navigate("/")
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Ошибка при входе"
      setError(errorMessage)
      console.error("Login failed:", error)
    }
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.logoContainer}>
          <img
            src={logoImg}
            alt="БАРС ГРУП"
            className={styles.logo}
          />
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <Field>
            <FieldContent>
              <Input
                {...register("login")}
                type="text"
                placeholder="Введите логин"
                autoComplete="off"
                aria-invalid={!!errors.login}
              />
            </FieldContent>
            <FieldError>{errors.login?.message}</FieldError>
          </Field>

          <Field>
            <FieldContent>
              <Input
                {...register("password")}
                type="password"
                placeholder="Введите пароль"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
              />
            </FieldContent>
            <FieldError>{errors.password?.message}</FieldError>
          </Field>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          <div className={styles.buttonContainer}>
            <Button
              type="submit"
              size="lg"
              className={styles.submitButton}
              loading={isSubmitting}
            >
              Войти
            </Button>
          </div>
        </form>

      </main>
    </div>
  )
}

export default Login
