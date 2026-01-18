import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchOnboardings,
  selectOnboarding,
  clearSelectedOnboarding,
} from '../../store/slices/onboardingSlice'
import OnboardingCard from './OnboardingCard'
import OnboardingListHeader from './OnboardingListHeader'
import LoadingSpinner from '../ui/LoadingSpinner'
import StepIndicator from '../form/StepIndicator'

function OnboardingList() {
  const dispatch = useDispatch()
  const { pendingOnboardings, selectedOnboarding, loading, onboardingSteps, currentStepOrder } =
    useSelector(state => state.onboarding)

  // Calculate completed steps from onboardingSteps
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
    // Don't allow opening if onboarding is completed or pending review
    if (
      onboarding.status === 'completed' ||
      onboarding.status === 'COMPLETED' ||
      onboarding.status === 'pending_review'
    ) {
      return
    }

    if (selectedOnboarding?.id === onboarding.id) {
      dispatch(clearSelectedOnboarding())
    } else {
      dispatch(selectOnboarding(onboarding.id))
    }
  }

  return (
    <div className="h-full">
      <OnboardingListHeader />

      {loading ? (
        <div className="text-center py-8">
          <LoadingSpinner text="Loading..." />
        </div>
      ) : pendingOnboardings.length > 0 ? (
        <>
          {/* Show Step Indicator in sidebar when onboarding is selected (Desktop only) */}
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
              {/* Show onboarding list when no onboarding is selected */}
              <div className="space-y-3">
                {pendingOnboardings.map(onboarding => {
                  const isActive = selectedOnboarding?.id === onboarding.id
                  const disabled =
                    onboarding.status === 'completed' ||
                    onboarding.status === 'COMPLETED' ||
                    onboarding.status === 'pending_review'

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
      ) : (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <p className="text-sm font-semibold flex items-center gap-2" style={{ color: '#0F5E7B' }}>
            <span>✓</span>
            <span>No pending onboarding tasks</span>
          </p>
        </div>
      )}
    </div>
  )
}

export default OnboardingList
