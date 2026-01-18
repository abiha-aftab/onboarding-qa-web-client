import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from '../store/slices/authSlice'
import ProtectedRoute from '../components/routing/ProtectedRoute'
import ErrorBoundary from '../components/routing/ErrorBoundary'
import ToastContainer from '../components/ui/ToastContainer'
import LoginPage from '../pages/LoginPage'
import HomePage from '../pages/HomePage'
import DashboardPage from '../pages/DashboardPage'
import OnboardingsPage from '../pages/OnboardingsPage'
import OnboardingDetailPage from '../pages/OnboardingDetailPage'
import NotFoundPage from '../pages/NotFoundPage'
import ServerErrorPage from '../pages/ServerErrorPage'

function AppRouter() {
  const dispatch = useDispatch()
  const { checkingAuth } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  if (checkingAuth) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #61C8D0, #FFE596)' }}
      >
        <div className="text-center">
          <div className="text-xl font-semibold" style={{ color: '#0F5E7B' }}>
            Loading...
          </div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboardings"
            element={
              <ProtectedRoute>
                <OnboardingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/:id/step/:stepId"
            element={
              <ProtectedRoute>
                <OnboardingDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default AppRouter
