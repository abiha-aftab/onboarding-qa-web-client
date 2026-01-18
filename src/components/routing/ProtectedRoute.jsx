import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const { isAuthenticated, checkingAuth } = useSelector(state => state.auth)

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
