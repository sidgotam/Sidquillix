import { Navigate, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar.jsx'
import { ToastViewport } from './components/Toast.jsx'
import { useAuth } from './hooks/useAuth.js'
import { useTheme } from './hooks/useTheme.js'
import { CreateExpressionPage } from './pages/CreateExpressionPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'
import { AuthPage } from './pages/AuthPage.jsx'

function ProtectedRoute({ isAuthed, children }) {
  if (!isAuthed) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  useTheme()
  const auth = useAuth()

  return (
    <div className="min-h-dvh bg-night bg-sidquillix-radial">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute left-1/2 top-[-320px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/30 via-indigo-500/10 to-sky-500/20 blur-3xl" />
      </div>

      <Navbar auth={auth} />

      <main className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-6 md:px-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/create"
            element={
              <ProtectedRoute isAuthed={auth.isAuthed}>
                <CreateExpressionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthed={auth.isAuthed}>
                <ProfilePage auth={auth} />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<AuthPage auth={auth} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <ToastViewport />
    </div>
  )
}
