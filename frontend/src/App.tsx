import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import Login from "@/pages/login"
import { Users } from "@/pages/users"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Role } from "@/api/auth"
import { SideMenu } from "@/components/side-menu"
import { ModalProvider } from "@/providers/ModalProvider"
import Modal from "@/components/ui/modal"
import styles from "./App.module.css"
import { Vacancies } from "./pages/vacancies"
import { AuditLog } from "@/pages/audit-log"
import { CompetencyAssessment } from "@/pages/competency-assessment"
import "simplebar-react/dist/simplebar.min.css";

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
  const { logout } = useCurrentUser()

  return (
    <div className={styles.layout}>
      <SideMenu onLogout={logout} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <ModalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>

              <Route path="/" element={<div>Главная</div>} />

              <Route
                element={<ProtectedRoute allowedRoles={[Role.HR, Role.Approver, Role.Admin, Role.SuperAdmin]} />}
              >
                <Route path="/candidates" element={<div>Кандидаты</div>} />
                <Route path="/interviews" element={<div>Собеседования</div>} />
                <Route path="/vacancies" element={<Vacancies />} />
                <Route path="/competency-assessment" element={<CompetencyAssessment />} />
              </Route>

              <Route
                element={<ProtectedRoute allowedRoles={[Role.Admin, Role.SuperAdmin]} />}
              >
                <Route path="/users" element={<Users />} />
                <Route path="/audit-log" element={<AuditLog />} />
              </Route>

            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Modal />
    </ModalProvider>
  )
}

export default App