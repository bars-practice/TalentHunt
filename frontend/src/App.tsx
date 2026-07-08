import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import Login from "@/pages/login"
import { Users } from "@/pages/users"
import { usePermissions } from "@/hooks/usePermissions"
import { Role } from "@/api/auth"
import { SideMenu } from "@/components/side-menu"
import { ModalProvider } from "@/providers/ModalProvider"
import Modal from "@/components/ui/modal"
import styles from "./App.module.css"
import { Vacancies } from "./pages/vacancies"
import { AuditLog } from "@/pages/audit-log"
import { CompetencyAssessment } from "@/pages/assessment"
import { Permission, hasPermission, isAdministrativeRole } from "@/utils/permissions"
import "simplebar-react/dist/simplebar.min.css";

interface ProtectedRouteProps {
  allowedRoles?: Role[]
  requiredPermission?: Permission
}

export function ProtectedRoute({ allowedRoles, requiredPermission }: ProtectedRouteProps) {
  const { user, loading } = usePermissions()
  if (loading) {
    return null
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

function Layout() {
  const { logout } = usePermissions()

  return (
    <div className={styles.layout}>
      <SideMenu onLogout={logout} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

function HomeRedirect() {
  const { user, loading } = usePermissions()

  if (loading || !user) {
    return null
  }

  if (isAdministrativeRole(user.role)) {
    return <Navigate to="/vacancies" replace />
  }
  if (hasPermission(user, Permission.CanViewVacancies)) {
    return <Navigate to="/vacancies" replace />
  }
  if (hasPermission(user, Permission.CanViewCandidates)) {
    return <Navigate to="/candidates" replace />
  }
  if (hasPermission(user, Permission.CanViewInterviews)) {
    return <Navigate to="/interviews" replace />
  }

  return <div>Добро пожаловать</div>
}

function App() {
  return (
    <ModalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>

              <Route path="/" element={<HomeRedirect />} />

              <Route element={<ProtectedRoute requiredPermission={Permission.CanViewCandidates} />}>
                <Route path="/candidates" element={<div>Кандидаты</div>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermission={Permission.CanViewInterviews} />}>
                <Route path="/interviews" element={<div>Собеседования</div>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermission={Permission.CanViewVacancies} />}>
                <Route path="/vacancies" element={<Vacancies />} />
              </Route>

              <Route element={<ProtectedRoute requiredPermission={Permission.CanViewInterviews} />}>
                <Route path="/assessment/:id" element={<CompetencyAssessment />} />
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
