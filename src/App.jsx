import { useState, useEffect } from 'react'
import './App.css'
import logo from './assets/68d68d4834b714f5ba55664d_Frame 2121450324.svg'
import { login, logout, getMe, getCurrentUser, isAuthenticated } from './services/authService'
import { getOnboardingStatus, getPendingOnboardings, fetchUserOnboardings, fetchOnboardingStep, submitStepAnswer, startOnboarding } from './services/onboardingService'
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
      if (err.status === 401) errorMsg = 'Invalid email or password. Please try again.'
      else if (err.status === 400) errorMsg = err.data?.message || err.message || 'Please check your input and try again.'
      else if (err.message) errorMsg = err.message
      else if (err.data?.message) errorMsg = err.data.message
      else if (err.data?.error) errorMsg = err.data.error
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

  if (isLoggedIn) return <Dashboard user={user} onLogout={handleLogout} />

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: 'linear-gradient(180deg ,#61C8D0,#FFE596)' }}>
      <div className="w-full flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-[400px] mx-auto space-y-6">
          <div className="text-center mb-6">
            <img src={logo} alt="Limitless Horizons Logo" className="h-20 mx-auto mb-3 w-auto max-w-[220px]" />
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
                  onChange={e => setEmail(e.target.value)}
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
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 text-base bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFD350] focus:border-[#0F5E7B] transition-all duration-200 placeholder-gray-400 hover:border-gray-300"
                  style={{ color: '#0F5E7B', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                />
              </div>

              {error && <div className="bg-red-100 border-2 border-red-300 text-red-800 text-sm text-center py-3 px-4 rounded-lg shadow-sm">{error}</div>}

              <button type="submit" disabled={loading} className={`btn-primary w-full py-3.5 px-6 rounded-lg text-base font-bold shadow-md hover:shadow-lg ${loading ? '' : 'hover:scale-[1.02] active:scale-[0.98]'}`} style={{ fontSize: '1rem' }}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="mt-7 text-center">
              <a href="#" className="link-secondary text-sm font-semibold hover:underline" style={{ fontSize: '0.875rem' }}>
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
  const [onboardingSteps, setOnboardingSteps] = useState([])
  const [currentStepOrder, setCurrentStepOrder] = useState(1)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [loadingSteps, setLoadingSteps] = useState(false)

  useEffect(() => {
    const loadOnboardingData = async () => {
      if (user?.email) {
        setLoading(true)
        try {
          const status = await getOnboardingStatus()
          setOnboardingStatus(status)
          const pending = await getPendingOnboardings()
          setPendingOnboardings(pending)
        } catch (error) {
          console.error('Error loading onboarding data:', error)
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

  // Load steps when onboarding is selected
  useEffect(() => {
    const loadSteps = async () => {
      if (selectedOnboarding && !onboardingComplete) {
        setLoadingSteps(true)
        setOnboardingSteps([])
        
        try {
          // Determine which step to load based on status and completed_steps
          let stepToLoad = 1;
          
          if (selectedOnboarding.status === 'in_progress' || selectedOnboarding.status === 'inprogress') {
            // Resume at the next step after completed_steps
            stepToLoad = (selectedOnboarding.completed_steps || 0) + 1;
            // Ensure step is within valid range (1-3)
            stepToLoad = Math.max(1, Math.min(stepToLoad, selectedOnboarding.total_steps || 3));
            
            // Load all previous steps too, so user can navigate back
            const completedSteps = selectedOnboarding.completed_steps || 0;
            const steps = [];
            for (let i = 1; i < stepToLoad; i++) {
              try {
                const step = await fetchOnboardingStep(selectedOnboarding.id, i);
                steps.push(step);
              } catch (err) {
                console.error(`Error loading step ${i}:`, err);
              }
            }
            // Load the current step
            const currentStep = await fetchOnboardingStep(selectedOnboarding.id, stepToLoad);
            steps.push(currentStep);
            setOnboardingSteps(steps);
            setCurrentStepOrder(stepToLoad);
            setLoadingSteps(false);
            return;
          } else if (selectedOnboarding.status === 'pending_review') {
            // If pending review, show all steps but disable form
            // Load all steps up to the last completed step
            const completedSteps = selectedOnboarding.completed_steps || selectedOnboarding.total_steps || 3;
            const steps = [];
            for (let i = 1; i <= completedSteps; i++) {
              try {
                const step = await fetchOnboardingStep(selectedOnboarding.id, i);
                steps.push(step);
              } catch (err) {
                console.error(`Error loading step ${i}:`, err);
              }
            }
            setOnboardingSteps(steps);
            setCurrentStepOrder(completedSteps);
            setLoadingSteps(false);
            return;
          } else {
            // For pending status, start at step 1
            stepToLoad = 1;
          }
          
          // Fetch the step to load
          const step = await fetchOnboardingStep(selectedOnboarding.id, stepToLoad);
          setOnboardingSteps([step]);
          setCurrentStepOrder(stepToLoad);
        } catch (error) {
          console.error('Error loading step:', error)
          setSubmitStatus({
            type: 'error',
            message: error?.data?.detail || error?.message || 'Failed to load onboarding steps. Please try again.',
          })
        } finally {
          setLoadingSteps(false)
        }
      } else if (!selectedOnboarding) {
        // Clear steps when no onboarding is selected
        setOnboardingSteps([])
        setCurrentStepOrder(1)
        setOnboardingComplete(false)
      }
    }

    loadSteps()
  }, [selectedOnboarding])

  // Handle step submission
  const handleStepSubmit = async (onboardingId, stepId, formValues, stepQuestions) => {
    try {
      const response = await submitStepAnswer(onboardingId, stepId, formValues, stepQuestions)
      setSubmitStatus({ type: null, message: '' })
      
      // Refresh onboarding status to update sidebar
      const status = await getOnboardingStatus()
      setOnboardingStatus(status)
      const pending = await getPendingOnboardings()
      setPendingOnboardings(pending)
      
      // Update selected onboarding if it exists
      if (selectedOnboarding && selectedOnboarding.id === onboardingId) {
        const allOnboardings = await fetchUserOnboardings()
        const updatedOnboarding = allOnboardings.find(o => o.id === onboardingId)
        if (updatedOnboarding) {
          setSelectedOnboarding(updatedOnboarding)
        }
      }
      
      return response
    } catch (error) {
      console.error('Error submitting step:', error)
      const errorMessage = error?.data?.detail || error?.message || 'Failed to submit step. Please try again.'
      setSubmitStatus({
        type: 'error',
        message: errorMessage,
      })
      throw error
    }
  }

  // Handle step completion and fetch next step
  const handleStepComplete = async (stepIndex, step, values) => {
    if (!selectedOnboarding) return

    const nextStepOrder = currentStepOrder + 1

    // Don't fetch if we're already on the last step (Step 3)
    if (nextStepOrder > 3) {
      return
    }

    // Check if there are more steps to fetch
    try {
      const nextStep = await fetchOnboardingStep(selectedOnboarding.id, nextStepOrder)
      
      // Add the next step to the steps array
      setOnboardingSteps((prev) => {
        // Check if step already exists
        const exists = prev.some(s => s.id === nextStep.id || s.order === nextStep.order)
        if (exists) {
          return prev
        }
        return [...prev, nextStep]
      })
      
      // Update current step order
      setCurrentStepOrder(nextStepOrder)
    } catch (error) {
      // If step doesn't exist (404), we've completed all steps
      if (error?.status === 404) {
        // All steps completed, mark as complete
        setOnboardingComplete(true)
        // Refresh onboarding status - this will remove it from pending list
        const status = await getOnboardingStatus()
        setOnboardingStatus(status)
        const pending = await getPendingOnboardings()
        setPendingOnboardings(pending)
      } else {
        console.error('Error fetching next step:', error)
        setSubmitStatus({
          type: 'error',
          message: error?.data?.detail || error?.message || 'Failed to load next step. Please try again.',
        })
        throw error // Re-throw so form knows step fetch failed
      }
    }
  }

  // Handle final form submission
  const handleFinalSubmit = async (values) => {
    if (!selectedOnboarding) return

    try {
      setSubmitStatus({ type: null, message: '' })

      // Submit Step 3 (final step) if it has questions
      const lastStep = onboardingSteps[onboardingSteps.length - 1]
      if (lastStep && lastStep.step_questions && lastStep.step_questions.length > 0) {
        const sortedQuestions = [...lastStep.step_questions].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        )
        await handleStepSubmit(selectedOnboarding.id, lastStep.id, values, sortedQuestions)
      } else {
        // Submit empty response for completion step
        await handleStepSubmit(selectedOnboarding.id, lastStep.id, {}, [])
      }

      // Mark as complete (pending review)
      setOnboardingComplete(true)
      
      // Refresh onboarding status to get updated status (should be pending_review now)
      const status = await getOnboardingStatus()
      setOnboardingStatus(status)
      const pending = await getPendingOnboardings()
      setPendingOnboardings(pending)

      // Refresh the full onboarding list to update sidebar status
      const allOnboardings = await fetchUserOnboardings()
      // Update the pending onboardings list with fresh data (includes pending_review)
      const updatedPending = allOnboardings.filter(
        (onboarding) => 
          onboarding.status === 'pending' || 
          onboarding.status === 'inprogress' || 
          onboarding.status === 'in_progress' ||
          onboarding.status === 'pending_review'
      )
      setPendingOnboardings(updatedPending)

      // Update selected onboarding with new status
      const updatedOnboarding = allOnboardings.find(o => o.id === selectedOnboarding.id)
      if (updatedOnboarding) {
        setSelectedOnboarding(updatedOnboarding)
      }
    } catch (error) {
      console.error('Error submitting final form:', error)
      setSubmitStatus({
        type: 'error',
        message: error?.data?.detail || error?.message || 'Failed to submit form. Please try again.',
      })
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-gradient-to-r from-cyan-200 via-teal-200 to-yellow-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Limitless Horizons Logo" className="h-10" />
            </div>
            <div className="flex items-center gap-4">
              <span style={{ color: '#0F5E7B' }}>
                Welcome, <span className="font-semibold">{user?.email}</span>
              </span>
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
            <div className="border-b border-gray-300 mb-4"></div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-sm" style={{ color: '#576472' }}>
                Loading...
              </div>
            </div>
          ) : pendingOnboardings.length > 0 ? (
            <>
              <div className="space-y-3">
                {pendingOnboardings.map(onboarding => {
                  // Determine status text and styling
                  let statusText = 'Pending';
                  let statusBgColor = 'bg-orange-100';
                  let statusTextColor = 'text-orange-800';
                  let borderColor = '#f97316';
                  let isActive = selectedOnboarding?.id === onboarding.id;
                  
                  if (onboarding.status === 'in_progress' || onboarding.status === 'inprogress') {
                    statusText = 'In Progress';
                    statusBgColor = 'bg-blue-100';
                    statusTextColor = 'text-blue-800';
                    borderColor = '#3b82f6';
                  } else if (onboarding.status === 'pending_review') {
                    statusText = 'Pending Review';
                    statusBgColor = 'bg-yellow-100';
                    statusTextColor = 'text-yellow-800';
                    borderColor = '#eab308';
                  } else if (onboarding.status === 'pending') {
                    statusText = 'Pending';
                    statusBgColor = 'bg-orange-100';
                    statusTextColor = 'text-orange-800';
                    borderColor = '#f97316';
                  }
                  
                  // Determine current step for highlighting
                  const currentStep = onboarding.status === 'in_progress' || onboarding.status === 'inprogress'
                    ? (onboarding.completed_steps || 0) + 1
                    : onboarding.status === 'pending_review'
                    ? onboarding.completed_steps || onboarding.total_steps || 3
                    : 1;
                  const totalSteps = onboarding.total_steps || 3;

                  return (
                    <div
                      key={onboarding.id}
                      className={`bg-white border-2 rounded-lg p-4 shadow-sm transition-all ${
                        isActive ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{
                        borderColor: isActive ? '#0F5E7B' : borderColor,
                        ringColor: isActive ? '#0F5E7B' : 'transparent',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              isActive ? 'bg-[#0F5E7B]' : 'bg-orange-500'
                            }`}
                          >
                            {onboarding.id}
                          </div>
                          <span className="font-medium text-sm" style={{ color: '#0F5E7B' }}>
                            {onboarding.onboarding_title}
                          </span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${statusBgColor} ${statusTextColor}`}>
                          {statusText}
                        </span>
                      </div>
                      
                      {/* Step indicator */}
                      {(onboarding.status === 'in_progress' || onboarding.status === 'inprogress' || onboarding.status === 'pending_review') && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalSteps }, (_, i) => {
                              const stepNum = i + 1;
                              const isCompleted = stepNum <= (onboarding.completed_steps || 0);
                              const isCurrent = stepNum === currentStep && !isCompleted;
                              
                              return (
                                <div
                                  key={stepNum}
                                  className={`flex-1 h-2 rounded ${
                                    isCompleted
                                      ? 'bg-green-500'
                                      : isCurrent
                                      ? 'bg-blue-500'
                                      : 'bg-gray-200'
                                  }`}
                                  title={`Step ${stepNum}${isCompleted ? ' (Completed)' : isCurrent ? ' (Current)' : ''}`}
                                />
                              );
                            })}
                          </div>
                          <div className="text-xs mt-1" style={{ color: '#576472' }}>
                            Step {currentStep} of {totalSteps}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold flex items-center gap-2" style={{ color: '#0F5E7B' }}>
                <span>✓</span>
                <span>No pending onboarding tasks</span>
              </p>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-lg" style={{ color: '#0F5E7B' }}>
                  Loading...
                </div>
              </div>
            ) : pendingOnboardings.length > 0 ? (
              <div className="bg-white border-2 border-orange-300 rounded-lg p-6 shadow-md mb-6">
                <h2 className="font-bold mb-4" style={{ color: '#0F5E7B', fontSize: '1rem' }}>
                  Onboarding Tasks
                </h2>
                <div className="space-y-3">
                  {pendingOnboardings.map(onboarding => {
                    const completedSteps =
                      onboarding.steps?.filter(s => s.status === 'completed').length || 0
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
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              onboarding.status === 'pending'
                                ? 'bg-orange-200 text-orange-800'
                                : onboarding.status === 'pending_review'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-blue-200 text-blue-800'
                            }`}
                          >
                            {onboarding.status === 'pending'
                              ? 'Pending'
                              : onboarding.status === 'pending_review'
                              ? 'Pending Review'
                              : 'In Progress'}
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
                                  width: `${progressPercent}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={async () => {
                            // Don't allow opening if onboarding is completed
                            if (onboarding.status === 'completed' || onboarding.status === 'COMPLETED') {
                              return;
                            }
                            
                            // Don't allow opening if pending review
                            if (onboarding.status === 'pending_review') {
                              return;
                            }
                            
                            if (selectedOnboarding?.id === onboarding.id) {
                              // Hide form
                              setSelectedOnboarding(null)
                              setOnboardingSteps([])
                              setCurrentStepOrder(1)
                              setOnboardingComplete(false)
                            } else {
                              // If status is pending, start onboarding first
                              if (onboarding.status === 'pending') {
                                try {
                                  setLoading(true);
                                  const updatedOnboarding = await startOnboarding(onboarding.id);
                                  // Refresh onboarding list
                                  const status = await getOnboardingStatus();
                                  setOnboardingStatus(status);
                                  const pending = await getPendingOnboardings();
                                  setPendingOnboardings(pending);
                                  // Set the updated onboarding as selected
                                  setSelectedOnboarding(updatedOnboarding);
                                } catch (error) {
                                  console.error('Error starting onboarding:', error);
                                  setSubmitStatus({
                                    type: 'error',
                                    message: error?.data?.detail || error?.message || 'Failed to start onboarding. Please try again.',
                                  });
                                } finally {
                                  setLoading(false);
                                }
                              } else {
                                // Show form (status is in_progress)
                                setSelectedOnboarding(onboarding);
                              }
                            }
                          }}
                          disabled={
                            onboarding.status === 'completed' || 
                            onboarding.status === 'COMPLETED' ||
                            onboarding.status === 'pending_review' ||
                            loading
                          }
                          className={`mt-4 w-full px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                            onboarding.status === 'completed' || 
                            onboarding.status === 'COMPLETED' ||
                            onboarding.status === 'pending_review'
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : loading
                              ? 'bg-gray-400 text-gray-600 cursor-wait'
                              : 'bg-[#0F5E7B] text-white hover:bg-[#0d4d66]'
                          }`}
                        >
                          {onboarding.status === 'completed' || onboarding.status === 'COMPLETED'
                            ? 'Completed'
                            : onboarding.status === 'pending_review'
                            ? 'Pending Review'
                            : selectedOnboarding?.id === onboarding.id
                            ? 'Hide Form'
                            : onboarding.status === 'pending'
                            ? 'Start Onboarding'
                            : 'Resume Onboarding'}
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
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold">{submitStatus.message}</span>
                  </div>
                  <button
                    onClick={() => setSubmitStatus({ type: null, message: '' })}
                    className="text-current opacity-70 hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {selectedOnboarding && (
              <div className="mt-6">
                {selectedOnboarding.status === 'pending_review' ? (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-yellow-300">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-8 text-center">
                      <div className="mb-4">
                        <div className="w-20 h-20 mx-auto bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <h2 className="text-3xl font-bold mb-2" style={{ color: '#0F5E7B' }}>
                        Pending for Review
                      </h2>
                      <p className="text-lg mb-6" style={{ color: '#576472' }}>
                        Your onboarding has been submitted successfully and is now pending review. You will be notified once it has been reviewed.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedOnboarding(null)
                          setOnboardingSteps([])
                          setCurrentStepOrder(1)
                          setOnboardingComplete(false)
                        }}
                        className="px-6 py-3 bg-[#0F5E7B] text-white rounded-lg font-semibold hover:bg-[#0d4d66] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : loadingSteps ? (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-gray-100">
                    <svg className="animate-spin h-10 w-10 mx-auto mb-3" style={{ color: '#0F5E7B' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-semibold" style={{ color: '#0F5E7B' }}>Loading onboarding steps...</p>
                  </div>
                ) : onboardingComplete ? (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100">
                    <div className="bg-gradient-to-r from-green-50 to-cyan-50 px-6 py-8 text-center">
                      <div className="mb-4">
                        <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <h2 className="text-3xl font-bold mb-2" style={{ color: '#0F5E7B' }}>
                        Onboarding Completed Successfully!
                      </h2>
                      <p className="text-lg mb-6" style={{ color: '#576472' }}>
                        Thank you for completing the onboarding process. Your information has been submitted and will be reviewed.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedOnboarding(null)
                          setOnboardingSteps([])
                          setCurrentStepOrder(1)
                          setOnboardingComplete(false)
                        }}
                        className="px-6 py-3 bg-[#0F5E7B] text-white rounded-lg font-semibold hover:bg-[#0d4d66] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : onboardingSteps.length > 0 ? (
                  <MultiStepForm
                    steps={onboardingSteps}
                    onboardingId={selectedOnboarding.id}
                    onSubmitStep={handleStepSubmit}
                    onStepComplete={handleStepComplete}
                    onSubmit={handleFinalSubmit}
                    totalSteps={3}
                    currentStepOrder={currentStepOrder}
                  />
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-gray-100">
                    <p className="text-lg font-semibold mb-2" style={{ color: '#0F5E7B' }}>
                      No steps available
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Unable to load onboarding steps. Please try again.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedOnboarding(null)
                        setOnboardingSteps([])
                        setCurrentStepOrder(1)
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
