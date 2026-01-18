import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../store/slices/authSlice'
import { showToast } from '../store/slices/uiSlice'
import logo from '../assets/68d68d4834b714f5ba55664d_Frame 2121450324.svg'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useSelector(state => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (error) {
      let errorMsg = 'Failed to login. Please check your credentials.'
      if (error.status === 401) {
        errorMsg = 'Invalid email or password. Please try again.'
      } else if (error.status === 400) {
        errorMsg = error.data?.message || error.message || 'Please check your input and try again.'
      } else if (error.message) {
        errorMsg = error.message
      } else if (error.data?.message) {
        errorMsg = error.data.message
      } else if (error.data?.error) {
        errorMsg = error.data.error
      }
      dispatch(showToast({ type: 'error', message: errorMsg }))
    }
  }, [error, dispatch])

  const handleSubmit = async e => {
    e.preventDefault()
    const result = await dispatch(loginUser({ email, password }))

    if (loginUser.fulfilled.match(result)) {
      dispatch(showToast({ type: 'success', message: 'Login successful!' }))
      navigate('/')
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #61C8D0, #FFE596)' }}
    >
      <div className="w-full flex items-center justify-center py-4 sm:py-8 px-4">
        <div className="w-full max-w-[400px] mx-auto space-y-4 sm:space-y-6">
          <div className="text-center mb-4 sm:mb-6">
            <img
              src={logo}
              alt="Limitless Horizons Logo"
              className="h-16 sm:h-20 mx-auto mb-2 sm:mb-3 w-auto max-w-[180px] sm:max-w-[220px]"
            />
          </div>

          <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-10 w-full">
            <h1
              className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-center break-words"
              style={{ color: '#0F5E7B' }}
            >
              Welcome back
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mt-4 sm:mt-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm sm:text-base font-semibold mb-2 sm:mb-3 tracking-tight"
                  style={{ color: '#0F5E7B' }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 text-sm sm:text-base bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFD350] focus:border-[#0F5E7B] transition-all duration-200 placeholder-gray-400 hover:border-gray-300"
                  style={{ color: '#0F5E7B' }}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm sm:text-base font-semibold mb-2 sm:mb-3 tracking-tight"
                  style={{ color: '#0F5E7B' }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 text-sm sm:text-base bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFD350] focus:border-[#0F5E7B] transition-all duration-200 placeholder-gray-400 hover:border-gray-300"
                  style={{ color: '#0F5E7B' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn-primary w-full py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-bold shadow-md hover:shadow-lg ${loading ? '' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="mt-5 sm:mt-7 text-center">
              <a
                href="#"
                className="link-secondary text-xs sm:text-sm font-semibold hover:underline"
              >
                Forgot your password?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
