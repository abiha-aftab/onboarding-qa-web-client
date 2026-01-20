import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../store/slices/authSlice'
import { showToast } from '../../store/slices/uiSlice'
import logo from '../../assets/68d68d4834b714f5ba55664d_Frame 2121450324.svg'

function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading } = useSelector(state => state.auth)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      dispatch(showToast({ type: 'success', message: 'Logged out successfully' }))
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if API fails
      dispatch(showToast({ type: 'warning', message: 'Logged out locally' }))
    }
  }

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen)
  }

  const handleNavigation = path => {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <header
      className="bg-gradient-to-r from-cyan-200 via-teal-200 to-yellow-200 relative"
      style={{
        boxShadow: '0 1px 3px 0 rgba(255, 211, 80, 0.2), 0 1px 2px 0 rgba(15, 94, 123, 0.1)',
      }}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/')}
              className="hover:opacity-80 transition-opacity duration-200 bg-transparent border-none p-0"
              style={{ backgroundColor: 'transparent' }}
              aria-label="Go to home"
            >
              <img src={logo} alt="Limitless Horizons Logo" className="h-8 sm:h-10" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-sm sm:text-base" style={{ color: '#0F5E7B' }}>
              Welcome, <span className="font-semibold">{user?.email?.split('@')[0]}</span>
            </span>

            {/* Desktop Navigation buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => navigate('/onboardings')}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: '#FFD350',
                  color: '#0F5E7B',
                  boxShadow:
                    '0 4px 6px -1px rgba(255, 211, 80, 0.3), 0 2px 4px -1px rgba(255, 211, 80, 0.2)',
                }}
              >
                All Onboardings
              </button>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold"
                style={{
                  boxShadow:
                    '0 4px 6px -1px rgba(15, 94, 123, 0.3), 0 2px 4px -1px rgba(15, 94, 123, 0.2)',
                }}
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden relative">
              <button
                onClick={handleMenuToggle}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  menuOpen
                    ? 'bg-[#FFD350] text-[#0F5E7B] shadow-lg'
                    : 'bg-[#FFD350] text-[#0F5E7B] hover:bg-[#0F5E7B] hover:text-white shadow-md'
                }`}
                style={{
                  boxShadow: menuOpen
                    ? '0 4px 6px -1px rgba(255, 211, 80, 0.3), 0 2px 4px -1px rgba(255, 211, 80, 0.2)'
                    : '0 4px 6px -1px rgba(255, 211, 80, 0.3), 0 2px 4px -1px rgba(255, 211, 80, 0.2)',
                }}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>

              {/* Mobile Slide-in Menu from Right */}
              <div
                className={`fixed inset-y-0 right-0 w-64 z-50 transform transition-transform duration-300 ease-in-out ${
                  menuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow:
                    '-4px 0 6px -1px rgba(255, 211, 80, 0.3), -2px 0 4px -1px rgba(15, 94, 123, 0.2)',
                }}
              >
                {/* Menu Header with Close Button */}
                <div
                  className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-cyan-50 to-yellow-50"
                  style={{ borderColor: '#FFD350' }}
                >
                  <h2 className="text-lg font-bold" style={{ color: '#0F5E7B' }}>
                    Menu
                  </h2>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-lg transition-colors hover:bg-[#FFD350] hover:bg-opacity-50 bg-transparent"
                    style={{ color: '#0F5E7B', backgroundColor: 'transparent' }}
                    aria-label="Close menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Menu Items */}
                <div className="py-2 bg-white">
                  <button
                    onClick={() => handleNavigation('/onboardings')}
                    className="menu-item-button w-full px-4 py-3 text-left text-sm font-semibold transition-all duration-200 flex items-center gap-3 rounded-lg mx-2 text-[#0F5E7B] hover:bg-[#FFD350] hover:text-[#0F5E7B]"
                    style={{
                      backgroundColor: '#ffffff',
                      border: 'none',
                      padding: '0.75rem 1rem',
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    All Onboardings
                  </button>
                  <div
                    className="my-2 mx-2"
                    style={{ borderTop: '1px solid #FFD350', opacity: 0.5 }}
                  />
                  <button
                    onClick={async () => {
                      setMenuOpen(false)
                      await handleLogout()
                    }}
                    disabled={loading}
                    className="menu-item-button w-full px-4 py-3 text-left text-sm font-semibold transition-all duration-200 flex items-center gap-3 rounded-lg mx-2 text-[#0F5E7B] hover:bg-[#FFD350] hover:text-[#0F5E7B] disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#0F5E7B]"
                    style={{
                      backgroundColor: '#ffffff',
                      border: 'none',
                      padding: '0.75rem 1rem',
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {loading ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>

              {/* Backdrop overlay - using light brand colors */}
              {menuOpen && (
                <div
                  className="fixed inset-0 z-40 transition-opacity duration-300"
                  style={{
                    backgroundColor: 'rgba(224, 247, 250, 0.7)', // Light cyan with 70% opacity
                  }}
                  onClick={() => setMenuOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
