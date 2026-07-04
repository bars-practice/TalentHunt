import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import logoImg from "@/assets/logo.svg"
import styles from "./index.module.css"

function Login() {
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

        <form className={styles.form}>
          <Input 
            type="text" 
            placeholder="Логин" 
            required 
          />
          
          <Input 
            type="password" 
            placeholder="Пароль" 
            required 
          />
          
          <div className={styles.buttonContainer}>
            <Button 
              type="submit" 
              size="lg"
              className={styles.submitButton}
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
