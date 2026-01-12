import { useState, useEffect } from 'react'
import './App.css'
import logo from './assets/68d68d4834b714f5ba55664d_Frame 2121450324.svg'
import { login, logout, getMe, getCurrentUser, isAuthenticated } from './services/authService'
import { getOnboardingStatus, getPendingOnboardings } from './services/onboardingService'
import MultiStepForm from './components/MultiStepForm'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          try {
            const userData = await getMe()
            const currentUser = getCurrentUser()
            setUser(currentUser || { email: userData.email || userData.user?.email })
            setIsLoggedIn(true)
          } catch (err) {
            console.error('Auth check failed:', err)
            setIsLoggedIn(false)
            setUser(null)
          }
        } else {
          setIsLoggedIn(false)
          setUser(null)
        }
      } catch (err) {
        console.error('Error checking authentication:', err)
        setIsLoggedIn(false)
        setUser(null)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(email, password)
      
      const currentUser = getCurrentUser()
      setUser(currentUser || { email: response.email || response.user?.email || email })
      setIsLoggedIn(true)
      
      setEmail('')
      setPassword('')
    } catch (err) {
      let errorMsg = 'Failed to login. Please check your credentials.'
      
      if (err.status === 401) {
        errorMsg = 'Invalid email or password. Please try again.'
      } else if (err.status === 400) {
        errorMsg = err.data?.message || err.message || 'Please check your input and try again.'
      } else if (err.message) {
        errorMsg = err.message
      } else if (err.data?.message) {
        errorMsg = err.data.message
      } else if (err.data?.error) {
        errorMsg = err.data.error
      }
      
      setError(errorMsg)
      setIsLoggedIn(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setIsLoggedIn(false)
      setUser(null)
      setEmail('')
      setPassword('')
      setError('')
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: 'linear-gradient(180deg ,#61C8D0,#FFE596)' }}>
        <div className="text-center">
          <div className="text-xl font-semibold" style={{ color: '#0F5E7B' }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (isLoggedIn) {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: 'linear-gradient(180deg ,#61C8D0,#FFE596)' }}>
      <div className="w-full flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-[400px] mx-auto space-y-6">
          <div className="text-center mb-6">
            <img 
              src={logo} 
              alt="Limitless Horizons Logo" 
              className="h-20 mx-auto mb-3 w-auto max-w-[220px]"
            />
          </div>

          <div className="bg-white rounded-xl shadow-2xl p-10 w-full">
            <h1 className="text-2xl font-bold mb-4 whitespace-nowrap text-center" style={{ color: '#0F5E7B', fontSize: '1.5rem' }}>
              Welcome back
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
              <div>
                <label htmlFor="email" className="block text-base font-semibold mb-3 tracking-tight whitespace-nowrap" style={{ color: '#0F5E7B', fontSize: '1rem' }}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 text-base bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFD350] focus:border-[#0F5E7B] transition-all duration-200 placeholder-gray-400 hover:border-gray-300"
                  style={{ color: '#0F5E7B', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-base font-semibold mb-3 tracking-tight whitespace-nowrap" style={{ color: '#0F5E7B', fontSize: '1rem' }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 text-base bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFD350] focus:border-[#0F5E7B] transition-all duration-200 placeholder-gray-400 hover:border-gray-300"
                  style={{ color: '#0F5E7B', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                />
              </div>
              
              {error && (
                <div className="bg-red-100 border-2 border-red-300 text-red-800 text-sm text-center py-3 px-4 rounded-lg shadow-sm">
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className={`btn-primary w-full py-3.5 px-6 rounded-lg text-base font-bold shadow-md hover:shadow-lg ${
                  loading 
                    ? '' 
                    : 'hover:scale-[1.02] active:scale-[0.98]'
                }`}
                style={{ fontSize: '1rem' }}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
            
            <div className="mt-7 text-center">
              <a 
                href="#" 
                className="link-secondary text-sm font-semibold hover:underline"
                style={{ fontSize: '0.875rem' }}
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

function Dashboard({ user, onLogout }) {
  const [onboardingStatus, setOnboardingStatus] = useState(null)
  const [pendingOnboardings, setPendingOnboardings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOnboarding, setSelectedOnboarding] = useState(null)
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: '' })

  useEffect(() => {
    const loadOnboardingData = async () => {
      if (user?.email && user?.role) {
        setLoading(true)
        try {
          // Fetch onboarding status from backend
          const status = await getOnboardingStatus()
          setOnboardingStatus(status)
          
          // Fetch pending onboardings for dashboard
          const pending = await getPendingOnboardings()
          setPendingOnboardings(pending)
        } catch (error) {
          console.error('Error loading onboarding data:', error)
          // Set empty state on error
          setOnboardingStatus({
            status: 'pending',
            completedCount: 0,
            totalCount: 0,
            pendingCount: 0,
            pendingOnboardings: [],
            steps: [],
            onboardings: [],
          })
          setPendingOnboardings([])
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    loadOnboardingData()
  }, [user])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-gradient-to-r from-cyan-200 via-teal-200 to-yellow-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="Limitless Horizons Logo" 
                className="h-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <span style={{ color: '#0F5E7B' }}>Welcome, <span className="font-semibold">{user?.email}</span></span>
              <button
                onClick={onLogout}
                className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar - Onboarding Tasks */}
        <aside className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#0F5E7B' }}>
              Onboarding Tasks
            </h2>
            {/* Sidebar Divider */}
            <div className="border-b border-gray-300 mb-4"></div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-sm" style={{ color: '#576472' }}>Loading steps...</div>
            </div>
          ) : onboardingStatus && onboardingStatus.steps && onboardingStatus.steps.length > 0 ? (
            <>
              <div className="space-y-3">
                {onboardingStatus.steps.map((step) => {
                  // Any step that is NOT completed should be marked as Pending
                  const isCompleted = step.status === 'completed';
                  const stepStatus = isCompleted ? 'Completed' : 'Pending';
                  
                  return (
                    <div
                      key={step.id}
                      className="bg-white border-2 rounded-lg p-4 shadow-sm"
                      style={{
                        borderColor: isCompleted ? '#10b981' : '#f97316'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-orange-500 text-white'
                          }`}>
                            {isCompleted ? '✓' : step.order || step.id}
                          </div>
                          <span className="font-medium" style={{ color: '#0F5E7B' }}>
                            {step.title}
                          </span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          isCompleted
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {stepStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-300">
                <div className="text-sm" style={{ color: '#576472' }}>
                  <p className="mb-1">
                    <span className="font-semibold">Progress:</span> {onboardingStatus.completedCount} of {onboardingStatus.totalCount} steps
                  </p>
                  {onboardingStatus.totalCount > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          onboardingStatus.status === 'pending' ? 'bg-orange-400' : 'bg-green-400'
                        }`}
                        style={{ width: `${(onboardingStatus.completedCount / onboardingStatus.totalCount) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold" style={{ color: '#0F5E7B' }}>
                ✓ No pending onboarding tasks
              </p>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            {/* Onboarding Tasks Section */}
            {loading ? (
              <div className="text-center py-8">
                <div className="text-lg" style={{ color: '#0F5E7B' }}>Loading...</div>
              </div>
            ) : pendingOnboardings.length > 0 ? (
              <div className="bg-white border-2 border-orange-300 rounded-lg p-6 shadow-md mb-6">
                <h2 className="font-bold mb-4" style={{ color: '#0F5E7B', fontSize: '1rem' }}>
                  Onboarding Tasks
                </h2>
                <div className="space-y-3">
                  {pendingOnboardings.map((onboarding) => {
                    const completedSteps = onboarding.steps?.filter(s => s.status === 'completed').length || 0
                    const totalSteps = onboarding.steps?.length || 0
                    const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
                    
                    return (
                      <div
                        key={onboarding.id}
                        className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg" style={{ color: '#0F5E7B' }}>
                            {onboarding.onboarding_title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            onboarding.status === 'pending'
                              ? 'bg-orange-200 text-orange-800'
                              : 'bg-blue-200 text-blue-800'
                          }`}>
                            {onboarding.status === 'pending' ? 'Pending' : 'In Progress'}
                          </span>
                        </div>
                        {onboarding.steps && onboarding.steps.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm mb-2" style={{ color: '#576472' }}>
                              Steps: {completedSteps} / {totalSteps} completed
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-orange-400 h-2 rounded-full transition-all"
                                style={{
                                  width: `${progressPercent}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => setSelectedOnboarding(onboarding)}
                          className="mt-4 w-full px-4 py-2 bg-[#0F5E7B] text-white rounded-lg font-semibold hover:bg-[#0d4d66] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {selectedOnboarding?.id === onboarding.id ? 'Hide Form' : 'Start Onboarding'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {submitStatus.type === 'error' && (
              <div className="mt-4 p-4 rounded-lg border-2 bg-red-50 border-red-300 text-red-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">{submitStatus.message}</span>
                  </div>
                  <button
                    onClick={() => setSubmitStatus({ type: null, message: '' })}
                    className="text-current opacity-70 hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Multi-Step Form */}
            {selectedOnboarding && selectedOnboarding.steps && selectedOnboarding.steps.length > 0 && (
              <div className="mt-6">
                <MultiStepForm
                  steps={selectedOnboarding.steps}
                  onSubmit={async (values) => {
                    try {
                      setSubmitStatus({ type: null, message: '' });
                      
                      if (selectedOnboarding?.steps) {
                        if (onboardingStatus?.steps) {
                          const updatedStatusSteps = onboardingStatus.steps.map(step => {
                            if (step.onboardingId === selectedOnboarding.id) {
                              return { ...step, status: 'completed' };
                            }
                            return step;
                          });
                          
                          const completedCount = updatedStatusSteps.filter(s => s.status === 'completed').length;
                          const totalCount = updatedStatusSteps.length;
                          
                          setOnboardingStatus({
                            ...onboardingStatus,
                            steps: updatedStatusSteps,
                            completedCount,
                            totalCount,
                            status: completedCount === totalCount ? 'completed' : 'pending'
                          });
                        }
                        
                        const updatedSteps = selectedOnboarding.steps.map(step => ({
                          ...step,
                          status: 'completed'
                        }));
                        
                        const updatedOnboarding = {
                          ...selectedOnboarding,
                          steps: updatedSteps,
                          status: 'completed'
                        };
                        
                        setSelectedOnboarding(updatedOnboarding);
                        
                        const updatedPending = pendingOnboardings.filter(
                          onb => onb.id !== selectedOnboarding.id
                        );
                        setPendingOnboardings(updatedPending);
                      }
                      
                      await new Promise(resolve => setTimeout(resolve, 300));
                      
                      setLoading(true);
                      try {
                        const status = await getOnboardingStatus();
                        setOnboardingStatus(status);
                        const pending = await getPendingOnboardings();
                        setPendingOnboardings(pending);
                      } catch (refreshError) {
                        console.error('Error refreshing onboarding status:', refreshError);
                      } finally {
                        setLoading(false);
                      }
                      
                      setTimeout(() => {
                        setSelectedOnboarding(null);
                        setSubmitStatus({ type: null, message: '' });
                      }, 5000);
                    } catch (error) {
                      console.error('Submission error:', error);
                      setSubmitStatus({
                        type: 'error',
                        message: error.message || 'Failed to submit form. Please try again.'
                      });
                      throw error;
                    }
                  }}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
