import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchOnboardings,
  selectOnboarding,
  clearSelectedOnboarding,
} from '../../store/slices/onboardingSlice'
import OnboardingCard from './OnboardingCard'
import OnboardingListHeader from './OnboardingListHeader'
import OnboardingStatusTimeline from './OnboardingStatusTimeline'
import LoadingSpinner from '../ui/LoadingSpinner'
import StepIndicator from '../form/StepIndicator'

function OnboardingList({ currentOnboarding: propOnboarding = null, hideHeader = false }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { pendingOnboardings, selectedOnboarding, loading, onboardingSteps, currentStepOrder, onboardings } =
    useSelector(state => state.onboarding)

  const completedSteps = new Set()
  if (selectedOnboarding && onboardingSteps.length > 0) {
    const completedCount = selectedOnboarding.completed_steps || 0
    for (let i = 1; i <= completedCount; i++) {
      completedSteps.add(i)
    }
  }

  useEffect(() => {
    dispatch(fetchOnboardings())
  }, [dispatch])

  const handleSelectOnboarding = onboarding => {
    // Don't allow clicking on completed/approved/rejected/pending_review/inreview onboardings
    if (
      onboarding.status === 'completed' ||
      onboarding.status === 'COMPLETED' ||
      onboarding.status === 'pending_review' ||
      onboarding.status === 'inreview' ||
      onboarding.status === 'approved' ||
      onboarding.status === 'rejected'
    ) {
      return
    }

    // Determine which step to navigate to
    let targetStep = 1

    if (onboarding.status === 'in_progress' || onboarding.status === 'inprogress') {
      // Resume from where user left off
      targetStep = (onboarding.completed_steps || 0) + 1
    } else {
      // Pending onboarding - start from step 1
      targetStep = 1
    }

    
    navigate(`/onboarding/${onboarding.id}/step/${targetStep}`)
  }

  const currentOnboarding = propOnboarding || selectedOnboarding || 
    (onboardings && onboardings.length > 0 ? onboardings[0] : null)

  
  const isApprovedOrRejected = currentOnboarding && 
    (currentOnboarding.status === 'approved' || currentOnboarding.status === 'rejected')

  const getOnboardingTaskMessage = () => {
    if (!currentOnboarding) {
      return {
        text: 'No pending onboarding tasks',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgGradient: 'bg-gradient-to-r from-emerald-50 to-green-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
      }
    }

    const status = currentOnboarding.status?.toLowerCase() || 'pending'
    
    if (status === 'pending' || status === 'pending_review' || status === 'inreview') {
      return {
        text: 'Onboarding Pending',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgGradient: 'bg-gradient-to-r from-amber-50 to-orange-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
      }
    }
    
    if (status === 'in_progress' || status === 'inprogress') {
      return {
        text: 'Onboarding In Progress',
        icon: (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
        bgGradient: 'bg-gradient-to-r from-blue-50 to-cyan-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
      }
    }
    
    if (status === 'completed' || status === 'COMPLETED') {
      return {
        text: 'Onboarding Completed',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgGradient: 'bg-gradient-to-r from-emerald-50 to-green-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
      }
    }
    
    if (status === 'approved') {
      return {
        text: 'Onboarding Approved',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
        bgGradient: 'bg-gradient-to-r from-emerald-50 to-green-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
      }
    }
    
    if (status === 'rejected') {
      return {
        text: 'Onboarding Rejected',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
        bgGradient: 'bg-gradient-to-r from-red-50 to-rose-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
      }
    }

    return {
      text: 'No pending onboarding tasks',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGradient: 'bg-gradient-to-r from-emerald-50 to-green-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    }
  }

  const taskMessage = getOnboardingTaskMessage()

  return (
    <div className="h-full">
      <OnboardingListHeader hideHeading={hideHeader} />

      <div className={`${taskMessage.bgGradient} ${taskMessage.borderColor} border rounded-xl p-4 mb-4 shadow-sm`}>
        <div className="flex items-center gap-3">
          <div className={`${taskMessage.iconBg} ${taskMessage.iconColor} p-2 rounded-lg flex-shrink-0`}>
            {taskMessage.icon}
          </div>
          <p className={`text-sm font-semibold ${taskMessage.textColor} tracking-wide`}>
            {taskMessage.text}
          </p>
        </div>
      </div>

      {currentOnboarding && (
        <div className="mb-4">
          <OnboardingStatusTimeline status={currentOnboarding.status} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <LoadingSpinner text="Loading..." />
        </div>
      ) : !isApprovedOrRejected && pendingOnboardings.length > 0 ? (
        <>
          {selectedOnboarding && onboardingSteps.length > 0 ? (
            <div className="hidden lg:block">
              <StepIndicator
                totalSteps={selectedOnboarding.total_steps || onboardingSteps.length}
                currentStepOrder={currentStepOrder || 1}
                completedSteps={completedSteps}
                steps={onboardingSteps}
                horizontal={false}
              />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {pendingOnboardings.map(onboarding => {
                  const isActive = selectedOnboarding?.id === onboarding.id
                  const disabled =
                    onboarding.status === 'completed' ||
                    onboarding.status === 'COMPLETED' ||
                    onboarding.status === 'pending_review' ||
                    onboarding.status === 'inreview' ||
                    onboarding.status === 'approved' ||
                    onboarding.status === 'rejected'

                  return (
                    <OnboardingCard
                      key={onboarding.id}
                      onboarding={onboarding}
                      isActive={isActive}
                      onSelect={() => handleSelectOnboarding(onboarding)}
                      onDeselect={() => dispatch(clearSelectedOnboarding())}
                      disabled={disabled}
                    />
                  )
                })}
              </div>
            </>
          )}
        </>
      ) : null}
    </div>
  )
}

export default OnboardingList
