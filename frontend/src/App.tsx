import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="/projects/:id/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#111f35',
              color: '#e0e7ff',
              border: '1px solid #1a2d45',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#4ade80', secondary: '#0a1628' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#0a1628' },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
