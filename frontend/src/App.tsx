import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import Login from "@/pages/login"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Role } from "@/api/auth"
import { SideMenu } from "@/components/side-menu"
import styles from "./App.module.css"

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useCurrentUser()
  if (loading) {
    return null
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
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

            <Route
              element={<ProtectedRoute allowedRoles={[Role.HrDirector, Role.Recruiter, Role.Admin]} />}
            >
              <Route path="/candidates" element={<div>Кандидаты</div>} />
              <Route path="/interviews" element={<div>Собеседования</div>} />
              <Route path="/vacancies" element={<div>Вакансии</div>} />
            </Route>

            <Route
              element={<ProtectedRoute allowedRoles={[Role.Admin]} />}
            >
              <Route path="/users" element={<div>Пользователи</div>} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App