import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectOnboarding } from '../store/slices/onboardingSlice'
import DashboardLayout from '../components/layout/DashboardLayout'
import OnboardingList from '../components/onboarding/OnboardingList'
import OnboardingFormContainer from '../components/onboarding/OnboardingFormContainer'
import Alert from '../components/ui/Alert'

function DashboardPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const alerts = useSelector(state => state.ui.alerts)
  const { selectedOnboarding, pendingOnboardings, loading } = useSelector(state => state.onboarding)

  // Check if there are any pending onboardings
  const hasPendingOnboardings = pendingOnboardings && pendingOnboardings.length > 0

  // Auto-select the first pending onboarding if there's only one and none is selected
  useEffect(() => {
    if (
      !loading &&
      hasPendingOnboardings &&
      !selectedOnboarding &&
      pendingOnboardings.length === 1
    ) {
      const firstOnboarding = pendingOnboardings[0]
      // Only auto-select if it's not completed or pending review
      if (
        firstOnboarding.status !== 'completed' &&
        firstOnboarding.status !== 'COMPLETED' &&
        firstOnboarding.status !== 'pending_review' &&
        firstOnboarding.status !== 'inreview'
      ) {
        dispatch(selectOnboarding(firstOnboarding.id))
      }
    }
  }, [loading, hasPendingOnboardings, selectedOnboarding, pendingOnboardings, dispatch])

  return (
    <DashboardLayout sidebar={<OnboardingList />}>
      <div className="mb-6">
        {alerts.map(alert => (
          <Alert key={alert.id} alert={alert} />
        ))}

        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center border-2 border-gray-100">
            <p className="text-base sm:text-lg font-semibold" style={{ color: '#0F5E7B' }}>
              Loading...
            </p>
          </div>
        ) : !hasPendingOnboardings ? (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center border-2 border-gray-100">
            <div className="mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-green-600"
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
              <h2
                className="text-lg sm:text-xl md:text-2xl font-bold mb-2 break-words"
                style={{ color: '#0F5E7B' }}
              >
                No Pending Onboardings
              </h2>
              <p className="text-sm sm:text-base mb-4 sm:mb-6" style={{ color: '#576472' }}>
                You don't have any pending onboarding tasks at the moment.
              </p>
              <p className="text-xs sm:text-sm mb-4 sm:mb-6" style={{ color: '#576472' }}>
                To check the status of previous onboardings, visit the Onboardings page.
              </p>
              <button
                onClick={() => navigate('/onboardings')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-[#0F5E7B] text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-[#0d4d66] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
              >
                View All Onboardings
              </button>
            </div>
          </div>
        ) : selectedOnboarding ? (
          <div className="mt-4 sm:mt-6">
            <OnboardingFormContainer />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center border-2 border-gray-100">
            <p
              className="text-sm sm:text-base md:text-lg font-semibold mb-2 break-words"
              style={{ color: '#0F5E7B' }}
            >
              Select an onboarding task to get started
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Choose an onboarding task from the sidebar to begin or continue your onboarding
              process.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage
