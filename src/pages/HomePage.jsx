import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchOnboardings } from '../store/slices/onboardingSlice'
import DashboardLayout from '../components/layout/DashboardLayout'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function HomePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { pendingOnboardings, onboardings, loading } = useSelector((state) => state.onboarding)

  useEffect(() => {
    // Fetch onboardings on mount
    dispatch(fetchOnboardings())
  }, [dispatch])

  // Check if there's an onboarding in progress
  const inProgressOnboarding = pendingOnboardings?.find(
    (o) => o.status === 'in_progress' || o.status === 'inprogress'
  )

  const handleResumeOnboarding = () => {
    if (inProgressOnboarding) {
      const nextStep = (inProgressOnboarding.completed_steps || 0) + 1
      navigate(`/onboarding/${inProgressOnboarding.id}/step/${nextStep}`)
    }
  }

  const handleViewOnboardings = () => {
    navigate('/onboardings')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto w-full">
        {/* Greetings Section */}
        <div className="bg-gradient-to-r from-cyan-50 to-yellow-50 rounded-xl shadow-lg p-6 sm:p-8 mb-6 border-2 border-gray-200">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" style={{ color: '#0F5E7B' }}>
              Welcome, {user?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-2" style={{ color: '#576472' }}>
              Welcome to Limitless Horizons
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              We're excited to have you here. Let's get started on your journey.
            </p>
          </div>
        </div>

        {/* Onboarding Stats */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200 text-center">
            <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#0F5E7B' }}>
              {onboardings?.length || 0}
            </div>
            <div className="text-sm sm:text-base text-gray-600">Total Onboardings</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200 text-center">
            <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#0F5E7B' }}>
              {onboardings?.filter((o) => o.status === 'completed' || o.status === 'COMPLETED').length || 0}
            </div>
            <div className="text-sm sm:text-base text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200 text-center">
            <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#0F5E7B' }}>
              {pendingOnboardings?.length || 0}
            </div>
            <div className="text-sm sm:text-base text-gray-600">In Progress</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-2 border-gray-200">
          {inProgressOnboarding ? (
            // Onboarding in progress - Show resume option
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3" style={{ color: '#0F5E7B' }}>
                  Resume Your Onboarding
                </h2>
                <p className="text-base sm:text-lg mb-2" style={{ color: '#576472' }}>
                  You have an onboarding in progress
                </p>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  {inProgressOnboarding.onboarding_title} - Step{' '}
                  {(inProgressOnboarding.completed_steps || 0) + 1} of{' '}
                  {inProgressOnboarding.total_steps || 3}
                </p>
              </div>
              <button
                onClick={handleResumeOnboarding}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-[#0F5E7B] text-white rounded-lg text-base sm:text-lg font-semibold hover:bg-[#0d4d66] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
              >
                Resume Onboarding
              </button>
            </div>
          ) : (
            // No onboarding in progress - Show start option
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3" style={{ color: '#0F5E7B' }}>
                  Ready to Get Started?
                </h2>
                <p className="text-base sm:text-lg mb-2" style={{ color: '#576472' }}>
                  {onboardings?.length > 0
                    ? 'You have completed onboarding or have no pending tasks.'
                    : 'No onboarding tasks are available at the moment.'}
                </p>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  View all your onboardings to see completed tasks or start new ones.
                </p>
              </div>
              <button
                onClick={handleViewOnboardings}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-[#FFD350] text-[#0F5E7B] rounded-lg text-base sm:text-lg font-semibold hover:bg-[#ffcb33] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
              >
                View All Onboardings
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default HomePage
