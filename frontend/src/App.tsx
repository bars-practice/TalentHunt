import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import Login from "@/pages/login"
import { Users } from "@/pages/users"
import { usePermissions } from "@/hooks/usePermissions"
import { SideMenu } from "@/components/side-menu"
import { ModalProvider } from "@/providers/ModalProvider"
import Modal from "@/components/ui/modal"
import styles from "./App.module.css"
import { Vacancies } from "./pages/vacancies"
import { Candidates } from "@/pages/candidates"
import { AuditLog } from "@/pages/audit-log"
import { CompetencyAssessment } from "@/pages/assessment"
import { Interviews } from "@/pages/interviews"
import { Permission } from "@/utils/permissions"
import "simplebar-react/dist/simplebar.min.css";

interface ProtectedRouteProps {
  requiredPermission?: Permission
}

export function ProtectedRoute({ requiredPermission }: ProtectedRouteProps) {
  const { user, loading, hasPermission } = usePermissions()
  if (loading) {
    return null
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (requiredPermission && !hasPermission(requiredPermission)) {
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
  const { user, loading, hasPermission } = usePermissions()

  if (loading || !user) {
    return null
  }

  if (hasPermission(Permission.CanViewVacancies)) {
    return <Navigate to="/vacancies" replace />
  }
  if (hasPermission(Permission.CanViewCandidates)) {
    return <Navigate to="/candidates" replace />
  }
  if (hasPermission(Permission.CanViewInterviewSchedule)) {
    return <Navigate to="/interviews" replace />
  }
  if (hasPermission(Permission.CanManageUsers)) {
    return <Navigate to="/users" replace />
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
                <Route path="/candidates" element={<Candidates />} />
              </Route>

              <Route element={<ProtectedRoute requiredPermission={Permission.CanViewInterviewSchedule} />}>
                <Route path="/interviews" element={<Interviews />} />
              </Route>

              <Route element={<ProtectedRoute requiredPermission={Permission.CanViewVacancies} />}>
                <Route path="/vacancies" element={<Vacancies />} />
              </Route>

              <Route element={<ProtectedRoute requiredPermission={Permission.CanViewInterviews} />}>
                <Route path="/assessment/:id" element={<CompetencyAssessment />} />
              </Route>

              <Route element={<ProtectedRoute requiredPermission={Permission.CanManageUsers} />}>
                <Route path="/users" element={<Users />} />
              </Route>

              <Route element={<ProtectedRoute requiredPermission={Permission.CanViewAuditLog} />}>
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
