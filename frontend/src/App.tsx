import Button from "./components/ui/button"
import Input from "./components/ui/input"

export default function LoginPage() {
  return (
    <div>
      <header style={{ padding: "20px", color: "#666" }}>
        Страница входа
      </header>

      <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: "20px" }}>
        
        <div style={{ width: "150px", height: "150px", backgroundColor: "#ccc", display: "flex", alignItems: "center", justifyContent: "center", color: "#333" }}>
          логотип
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: "12px", width: "300px" }}>
          <div style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#fff" }}>
            <Input type="text" placeholder="Логин" required style={{ border: "none", outline: "none", width: "100%", padding: "0" }} />
          </div>

          <div style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#fff" }}>
            <Input type="password" placeholder="Пароль" required style={{ border: "none", outline: "none", width: "100%", padding: "0" }} />
          </div>
          
          <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
            <Button type="submit" style={{ padding: "8px 24px", backgroundColor: "#e0e0e0", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}>
              Войти
            </Button>
          </div>
        </form>

      </main>
    </div>
  )
}
