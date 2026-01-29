import { useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchOnboardingSteps,
  submitStep,
  updateFormData,
  setOnboardingComplete,
  fetchOnboardings,
  setCurrentStepOrder,
} from '../../store/slices/onboardingSlice'
import { showToast } from '../../store/slices/uiSlice'
import MultiStepForm from '../MultiStepForm'
import LoadingSpinner from '../ui/LoadingSpinner'
import StatusBadge from '../ui/StatusBadge'
import StepIndicator from '../form/StepIndicator'

function OnboardingFormContainer() {
  const dispatch = useDispatch()
  const {
    selectedOnboarding,
    onboardingSteps,
    currentStepOrder,
    formData,
    onboardingComplete,
    loadingSteps,
  } = useSelector(state => state.onboarding)

  const isLoadingRef = useRef(false)

  // Load steps when onboarding is selected
  useEffect(() => {
    const loadSteps = async () => {
      if (!selectedOnboarding || onboardingComplete || isLoadingRef.current) {
        return
      }

      isLoadingRef.current = true

      try {
        let stepToLoad = 1

        if (
          selectedOnboarding.status === 'in_progress' ||
          selectedOnboarding.status === 'inprogress'
        ) {
          // Resume at the next step after completed_steps
          stepToLoad = (selectedOnboarding.completed_steps || 0) + 1
          stepToLoad = Math.max(1, Math.min(stepToLoad, selectedOnboarding.total_steps || 3))

          const completedSteps = selectedOnboarding.completed_steps || 0

          // Load all previous steps plus current
          await dispatch(
            fetchOnboardingSteps({
              onboardingId: selectedOnboarding.id,
              stepOrder: stepToLoad,
              completedSteps,
            })
          ).unwrap()

          // Don't call fetchOnboardings here to avoid infinite loop
          // The steps are already loaded, status will be updated when step is submitted
        } else if (
          selectedOnboarding.status === 'pending_review' ||
          selectedOnboarding.status === 'inreview'
        ) {
          // Load all completed steps
          const completedSteps =
            selectedOnboarding.completed_steps || selectedOnboarding.total_steps || 3
          await dispatch(
            fetchOnboardingSteps({
              onboardingId: selectedOnboarding.id,
              stepOrder: completedSteps,
              completedSteps,
            })
          ).unwrap()
        } else {
          // For pending status, start at step 1
          await dispatch(
            fetchOnboardingSteps({
              onboardingId: selectedOnboarding.id,
              stepOrder: 1,
              completedSteps: 0,
            })
          ).unwrap()

          // Don't call fetchOnboardings here to avoid infinite loop
        }
      } catch (error) {
        console.error('Error loading step:', error)
        dispatch(
          showToast({
            type: 'error',
            message: error?.message || 'Failed to load onboarding steps. Please try again.',
          })
        )
      } finally {
        isLoadingRef.current = false
      }
    }

    loadSteps()
  }, [selectedOnboarding?.id, selectedOnboarding, dispatch, onboardingComplete])

  // Handle step submission
  const handleStepSubmit = useCallback(
    async (onboardingId, stepId, formValues, stepQuestions) => {
      try {
        await dispatch(
          submitStep({
            onboardingId,
            stepId,
            formValues,
            stepQuestions,
          })
        ).unwrap()

        dispatch(showToast({ type: 'success', message: 'Step submitted successfully' }))
      } catch (error) {
        dispatch(
          showToast({
            type: 'error',
            message: error?.message || 'Failed to submit step. Please try again.',
          })
        )
        throw error
      }
    },
    [dispatch]
  )

  // Handle step completion - all steps are already loaded, just refresh onboardings
  const handleStepComplete = useCallback(
    // eslint-disable-next-line no-unused-vars
    async (_stepIndex, _step, _values) => {
      if (!selectedOnboarding) return

      const nextStepOrder = currentStepOrder + 1

      // Check if we're on the last step
      if (nextStepOrder > (selectedOnboarding.total_steps || 3)) {
        // All steps completed
        dispatch(setOnboardingComplete(true))
        await dispatch(fetchOnboardings())
      } else {
        // Refresh onboardings to get updated status
        await dispatch(fetchOnboardings())
      }
    },
    [dispatch, selectedOnboarding, currentStepOrder]
  )

  // Handle form data changes
  const handleFormDataChange = useCallback(
    newFormData => {
      dispatch(updateFormData(newFormData))
    },
    [dispatch]
  )

  // Handle step changes (for back/forward navigation)
  const handleStepChange = useCallback(
    (stepIndex, step) => {
      if (step && step.order) {
        dispatch(setCurrentStepOrder(step.order))
      }
    },
    [dispatch]
  )

  // Handle final form submission
  const handleFinalSubmit = useCallback(
    // eslint-disable-next-line no-unused-vars
    async _values => {
      if (!selectedOnboarding) return

      try {
        dispatch(setOnboardingComplete(true))
        await dispatch(fetchOnboardings())
        dispatch(showToast({ type: 'success', message: 'Onboarding completed successfully!' }))
      } catch (error) {
        dispatch(
          showToast({
            type: 'error',
            message: error?.message || 'Failed to submit form. Please try again.',
          })
        )
        throw error
      }
    },
    [dispatch, selectedOnboarding]
  )

  if (!selectedOnboarding) {
    return null
  }

  if (selectedOnboarding.status === 'pending_review' || selectedOnboarding.status === 'inreview') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-yellow-300">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-8 text-center">
          <div className="mb-4">
            <div className="w-20 h-20 mx-auto bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
            style={{ color: '#0F5E7B' }}
          >
            Pending for Review
          </h2>
          <p className="text-base sm:text-lg mb-6" style={{ color: '#576472' }}>
            Your onboarding has been submitted successfully and is now pending review. You will be
            notified once it has been reviewed.
          </p>
        </div>
      </div>
    )
  }

  if (loadingSteps) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-gray-100">
        <LoadingSpinner size="lg" text="Loading onboarding steps..." />
      </div>
    )
  }

  if (onboardingComplete) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100">
        <div className="bg-gradient-to-r from-green-50 to-cyan-50 px-6 py-8 text-center">
          <div className="mb-4">
            <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
            style={{ color: '#0F5E7B' }}
          >
            Onboarding Completed Successfully!
          </h2>
          <p className="text-base sm:text-lg mb-6" style={{ color: '#576472' }}>
            Thank you for completing the onboarding process. Your information has been submitted and
            will be reviewed.
          </p>
        </div>
      </div>
    )
  }

  if (onboardingSteps.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-gray-100">
        <p className="text-lg font-semibold mb-2" style={{ color: '#0F5E7B' }}>
          No steps available
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Unable to load onboarding steps. Please try again.
        </p>
      </div>
    )
  }

  // Calculate completed steps
  const completedSteps = new Set()
  if (selectedOnboarding && onboardingSteps.length > 0) {
    const completedCount = selectedOnboarding.completed_steps || 0
    for (let i = 1; i <= completedCount; i++) {
      completedSteps.add(i)
    }
  }

  return (
    <div>
      {/* Onboarding Header */}
      <div className="bg-white rounded-xl shadow-lg mb-4 sm:mb-6 border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-50 to-yellow-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex-1 min-w-0">
                <h3
                  className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight"
                  style={{ color: '#0F5E7B' }}
                >
                  {selectedOnboarding.onboarding_title?.replace(/\d+$/, '').trim() || 'Onboarding'}
                </h3>
                <p className="text-xs sm:text-sm mt-1" style={{ color: '#576472' }}>
                  Step {currentStepOrder} of {selectedOnboarding.total_steps || 3}
                </p>
              </div>
            </div>
            <div className="self-start sm:self-auto">
              <StatusBadge status={selectedOnboarding.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Progress Indicator for Mobile */}
      <div className="lg:hidden mb-4">
        <StepIndicator
          totalSteps={selectedOnboarding.total_steps || onboardingSteps.length}
          currentStepOrder={currentStepOrder || 1}
          completedSteps={completedSteps}
          steps={onboardingSteps}
          horizontal={true}
        />
      </div>

      <MultiStepForm
        steps={onboardingSteps}
        onboardingId={selectedOnboarding.id}
        onSubmitStep={handleStepSubmit}
        onStepComplete={handleStepComplete}
        onSubmit={handleFinalSubmit}
        totalSteps={selectedOnboarding.total_steps || 3}
        currentStepOrder={currentStepOrder}
        initialValues={formData}
        onFormDataChange={handleFormDataChange}
        onStepChange={handleStepChange}
      />
    </div>
  )
}

export default OnboardingFormContainer
