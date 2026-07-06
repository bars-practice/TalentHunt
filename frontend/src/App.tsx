import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import Login from "@/pages/login"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { SideMenu } from "@/components/side-menu"
import styles from "./App.module.css"

export function ProtectedRoute() {
  const isAuthenticated = useAuthGuard()

  if (isAuthenticated === null) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function Layout() {
  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  return (
    <div className={styles.layout}>
      <SideMenu onLogout={handleLogout} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<div>Главная</div>} />
            <Route path="/candidates" element={<div>Кандидаты</div>} />
            <Route path="/interviews" element={<div>Собеседования</div>} />
            <Route path="/vacancies" element={<div>Вакансии</div>} />
            <Route path="/users" element={<div>Пользователи</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App