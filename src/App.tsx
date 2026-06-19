import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ToastContainer } from '@/components/common/ToastContainer'
import { useAuthStore } from '@/store/authStore'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import PatientsPage from '@/pages/PatientsPage'
import PatientDetailPage from '@/pages/PatientDetailPage'
import SessionsPage from '@/pages/SessionsPage'
import SessionDetailPage from '@/pages/SessionDetailPage'
import NewSessionPage from '@/pages/NewSessionPage'
import ReportsPage from '@/pages/ReportsPage'
import TemplatesPage from '@/pages/TemplatesPage'
import SettingsPage from '@/pages/SettingsPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
    <ToastContainer />
    <Routes>
      {/* Public */}
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected — shell layout */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"      element={<DashboardPage />} />
        <Route path="/patients"       element={<PatientsPage />} />
        <Route path="/patients/:id"   element={<PatientDetailPage />} />
        <Route path="/sessions"       element={<SessionsPage />} />
        <Route path="/sessions/new"   element={<NewSessionPage />} />
        <Route path="/sessions/:id"   element={<SessionDetailPage />} />
        <Route path="/reports"        element={<ReportsPage />} />
        <Route path="/templates"      element={<TemplatesPage />} />
        <Route path="/settings"       element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  )
}
