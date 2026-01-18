import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchOnboardings } from '../store/slices/onboardingSlice'
import DashboardLayout from '../components/layout/DashboardLayout'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function OnboardingsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { onboardings, loading } = useSelector((state) => state.onboarding)

  useEffect(() => {
    // Fetch all onboardings including completed ones
    dispatch(fetchOnboardings())
  }, [dispatch])

  // Sort onboardings: recent first (by created_at or id)
  const sortedOnboardings = [...onboardings].sort((a, b) => {
    // First sort by status: pending > in_progress > pending_review > completed
    const statusOrder = {
      pending: 0,
      in_progress: 1,
      inprogress: 1,
      pending_review: 2,
      completed: 3,
      COMPLETED: 3,
    }

    const aOrder = statusOrder[a.status] ?? 99
    const bOrder = statusOrder[b.status] ?? 99

    if (aOrder !== bOrder) {
      return aOrder - bOrder
    }

    // Then sort by ID (assuming higher ID = more recent) or created_at if available
    const aDate = a.created_at ? new Date(a.created_at) : new Date(a.id * 1000)
    const bDate = b.created_at ? new Date(b.created_at) : new Date(b.id * 1000)
    
    return bDate - aDate
  })

  const handleOnboardingClick = (onboarding) => {
    // Determine which step to navigate to
    let targetStep = 1
    
    if (onboarding.status === 'in_progress' || onboarding.status === 'inprogress') {
      // Resume from where user left off
      targetStep = (onboarding.completed_steps || 0) + 1
    } else if (onboarding.status === 'pending_review' || onboarding.status === 'completed' || onboarding.status === 'COMPLETED') {
      // View from the first step (completed onboardings are view-only)
      targetStep = 1
    } else {
      // Pending onboarding - start from step 1
      targetStep = 1
    }
    
    // Navigate to detail page
    navigate(`/onboarding/${onboarding.id}/step/${targetStep}`)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading onboardings..." />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 break-words" style={{ color: '#0F5E7B' }}>
            All Onboardings
          </h2>
          <p className="text-xs sm:text-sm md:text-base" style={{ color: '#576472' }}>
            View and manage all your onboarding tasks. Recent items appear at the top.
          </p>
        </div>

        {sortedOnboardings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
            <p className="text-base sm:text-lg font-semibold mb-2" style={{ color: '#0F5E7B' }}>
              No onboardings found
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              You don't have any onboarding tasks yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {sortedOnboardings.map((onboarding) => {
              const currentStep =
                onboarding.status === 'in_progress' || onboarding.status === 'inprogress'
                  ? (onboarding.completed_steps || 0) + 1
                  : onboarding.status === 'pending_review'
                  ? onboarding.completed_steps || onboarding.total_steps || 3
                  : onboarding.status === 'completed' || onboarding.status === 'COMPLETED'
                  ? onboarding.total_steps || 3
                  : 1
              const totalSteps = onboarding.total_steps || 3

              return (
                <div
                  key={onboarding.id}
                  className="bg-white rounded-xl shadow-md border-2 border-gray-200 hover:border-[#0F5E7B] transition-all duration-200 cursor-pointer overflow-hidden"
                  onClick={() => handleOnboardingClick(onboarding)}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: '#0F5E7B' }}
                        >
                          {onboarding.id}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 break-words" style={{ color: '#0F5E7B' }}>
                            {onboarding.onboarding_title}
                          </h3>
                          {onboarding.created_at && (
                            <p className="text-xs sm:text-sm text-gray-500">
                              Created: {new Date(onboarding.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="self-start sm:self-auto">
                        <StatusBadge status={onboarding.status} className="text-xs sm:text-sm px-2 sm:px-3 py-1" />
                      </div>
                    </div>

                    {/* Progress section */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-semibold" style={{ color: '#576472' }}>
                          Progress
                        </span>
                        <span className="text-xs sm:text-sm font-semibold" style={{ color: '#0F5E7B' }}>
                          {currentStep} of {totalSteps} steps
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: totalSteps }, (_, i) => {
                          const stepNum = i + 1
                          const isCompleted = stepNum <= (onboarding.completed_steps || 0)
                          const isCurrent =
                            stepNum === currentStep &&
                            !isCompleted &&
                            (onboarding.status === 'in_progress' ||
                              onboarding.status === 'inprogress')
                          const isPendingReview = onboarding.status === 'pending_review'

                          return (
                            <div
                              key={stepNum}
                              className={`flex-1 h-3 rounded ${
                                isCompleted
                                  ? 'bg-green-500'
                                  : isCurrent
                                  ? 'bg-blue-500'
                                  : isPendingReview && stepNum <= currentStep
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-200'
                              }`}
                              title={`Step ${stepNum}${
                                isCompleted ? ' (Completed)' : isCurrent ? ' (Current)' : ''
                              }`}
                            />
                          )
                        })}
                      </div>
                      <div className="flex items-center justify-between text-xs" style={{ color: '#576472' }}>
                        <span>
                          Completed: {onboarding.completed_steps || 0} / {totalSteps}
                        </span>
                        {onboarding.completed_steps > 0 && (
                          <span>
                            {Math.round(((onboarding.completed_steps || 0) / totalSteps) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                      <button
                        className="w-full px-4 py-2 sm:py-2.5 bg-[#0F5E7B] text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-[#0d4d66] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOnboardingClick(onboarding)
                        }}
                      >
                        {onboarding.status === 'completed' || onboarding.status === 'COMPLETED'
                          ? 'View Details'
                          : onboarding.status === 'pending_review'
                          ? 'View Status'
                          : onboarding.status === 'in_progress' || onboarding.status === 'inprogress'
                          ? 'Continue Onboarding'
                          : 'Start Onboarding'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default OnboardingsPage
