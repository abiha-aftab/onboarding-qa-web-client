import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import {
  fetchOnboardings,
  fetchOnboardingSteps,
  submitStep,
  updateFormData,
  setCurrentStepOrder,
  setOnboardingComplete,
  selectOnboarding,
} from '../store/slices/onboardingSlice'
import { getOnboardingStatusById } from '../services/onboardingService'
import { showToast } from '../store/slices/uiSlice'
import DashboardLayout from '../components/layout/DashboardLayout'
import OnboardingList from '../components/onboarding/OnboardingList'
import MultiStepForm from '../components/MultiStepForm'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatusBadge from '../components/ui/StatusBadge'
import StepIndicator from '../components/form/StepIndicator'
import Alert from '../components/ui/Alert'

function OnboardingDetailPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id, stepId } = useParams()
  const onboardingId = parseInt(id, 10)
  const stepOrder = parseInt(stepId, 10)
  const alerts = useSelector(state => state.ui.alerts)
  const {
    onboardings,
    selectedOnboarding,
    onboardingSteps,
    currentStepOrder,
    formData,
    onboardingComplete,
    loadingSteps,
    loading,
  } = useSelector(state => state.onboarding)

  const onboarding = selectedOnboarding || onboardings.find(o => o.id === onboardingId)

  const isReadOnly =
    onboarding &&
    (onboarding.status === 'completed' ||
      onboarding.status === 'COMPLETED' ||
      onboarding.status === 'pending_review' ||
      onboarding.status === 'approved' ||
      onboarding.status === 'rejected')

  useEffect(() => {
    const loadOnboardingData = async () => {
      if (!onboardingId || isNaN(onboardingId)) {
        dispatch(showToast({ type: 'error', message: 'Invalid onboarding ID' }))
        navigate('/onboardings')
        return
      }

      try {
        const fetchResult = await dispatch(fetchOnboardings()).unwrap()
        const allOnboardings = fetchResult.status?.onboardings || []

        const foundOnboarding = allOnboardings.find(o => o.id === onboardingId)

        if (!foundOnboarding) {
          throw new Error(`Onboarding with ID ${onboardingId} not found`)
        }

        try {
          await dispatch(selectOnboarding(onboardingId)).unwrap()
        } catch {
          console.log('Onboarding not in pending list, continuing anyway')
        }

        let statusData = null
        try {
          statusData = await getOnboardingStatusById(onboardingId)
          if (statusData) {
            foundOnboarding.status = statusData.status
            foundOnboarding.review_reason = statusData.review_reason
          }
        } catch (error) {
          console.warn('Could not fetch status from endpoint, using cached status:', error)
        }

        const onboardingForSteps = foundOnboarding
        const isRejectedOrApproved =
          onboardingForSteps.status === 'approved' || onboardingForSteps.status === 'rejected'

        if (isRejectedOrApproved) {
          return
        }

        const completedSteps = onboardingForSteps.completed_steps || 0
        const totalSteps = onboardingForSteps.total_steps || 3
        const isCompletedOrReview =
          onboardingForSteps.status === 'completed' ||
          onboardingForSteps.status === 'COMPLETED' ||
          onboardingForSteps.status === 'pending_review'

        let targetStepOrder
        if (stepOrder) {
          if (isCompletedOrReview) {
            targetStepOrder = Math.min(Math.max(1, stepOrder), totalSteps)
          } else {
            const maxAllowedStep = completedSteps + 1
            if (stepOrder > maxAllowedStep) {
              const correctStep = Math.min(maxAllowedStep, totalSteps)
              dispatch(
                showToast({
                  type: 'warning',
                  message: `Please complete step ${completedSteps + 1} first before accessing future steps.`,
                })
              )
              navigate(`/onboarding/${onboardingId}/step/${correctStep}`, { replace: true })
              return
            }
            targetStepOrder = Math.min(Math.max(1, stepOrder), totalSteps)
          }
        } else {
          if (isCompletedOrReview) {
            targetStepOrder = completedSteps || totalSteps || 1
          } else {
            targetStepOrder = Math.min(completedSteps + 1, totalSteps) || 1
          }
        }

        await dispatch(
          fetchOnboardingSteps({
            onboardingId,
            stepOrder: targetStepOrder,
            completedSteps,
          })
        ).unwrap()
      } catch (error) {
        console.error('Error loading onboarding:', error)
        dispatch(
          showToast({
            type: 'error',
            message: error?.message || 'Failed to load onboarding. Please try again.',
          })
        )
        navigate('/onboardings')
      }
    }

    loadOnboardingData()
  }, [onboardingId, stepOrder, dispatch, navigate])

  useEffect(() => {
    if (!onboarding || !stepOrder) return

    const completedSteps = onboarding.completed_steps || 0
    const totalSteps = onboarding.total_steps || onboardingSteps.length || 3
    const isCompletedOrReview =
      onboarding.status === 'completed' ||
      onboarding.status === 'COMPLETED' ||
      onboarding.status === 'pending_review' ||
      onboarding.status === 'approved' ||
      onboarding.status === 'rejected'

    if (!isCompletedOrReview) {
      const maxAllowedStep = completedSteps + 1
      if (stepOrder > maxAllowedStep) {
        const correctStep = Math.min(maxAllowedStep, totalSteps)
        dispatch(
          showToast({
            type: 'warning',
            message: `Please complete step ${completedSteps + 1} first before accessing future steps.`,
          })
        )
        navigate(`/onboarding/${onboardingId}/step/${correctStep}`, { replace: true })
        return
      }
    }

    if (stepOrder !== currentStepOrder && stepOrder >= 1 && stepOrder <= totalSteps) {
      dispatch(setCurrentStepOrder(stepOrder))
    }
  }, [
    stepOrder,
    currentStepOrder,
    dispatch,
    onboarding,
    onboardingSteps.length,
    onboardingId,
    navigate,
  ])

  const handleStepSubmit = useCallback(
    async (onboardingId, stepId, formValues, stepQuestions) => {
      if (isReadOnly) {
        return
      }

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
    [dispatch, isReadOnly]
  )

  const handleStepComplete = useCallback(
    // eslint-disable-next-line no-unused-vars
    async (_stepIndex, _step, _values) => {
      if (!onboarding) return

      const nextStepOrder = currentStepOrder + 1
      const totalSteps = onboarding.total_steps || onboardingSteps.length

      if (nextStepOrder > totalSteps) {
        dispatch(setOnboardingComplete(true))
        await dispatch(fetchOnboardings())
      } else {
        await dispatch(fetchOnboardings())
        navigate(`/onboarding/${onboardingId}/step/${nextStepOrder}`)
      }
    },
    [dispatch, onboarding, currentStepOrder, onboardingSteps.length, onboardingId, navigate]
  )

  const handleStepBack = useCallback(
    // eslint-disable-next-line no-unused-vars
    (prevStepOrder, _prevStep) => {
      if (!onboarding || prevStepOrder < 1) return
      navigate(`/onboarding/${onboardingId}/step/${prevStepOrder}`)
    },
    [onboarding, onboardingId, navigate]
  )

  const handleFormDataChange = useCallback(
    newFormData => {
      if (!isReadOnly) {
        dispatch(updateFormData(newFormData))
      }
    },
    [dispatch, isReadOnly]
  )

  const handleFinalSubmit = useCallback(
    // eslint-disable-next-line no-unused-vars
    async _values => {
      if (!onboarding || isReadOnly) return

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
    [dispatch, onboarding, isReadOnly]
  )

  if (loading || loadingSteps || !onboarding) {
    return (
      <DashboardLayout sidebar={<OnboardingList hideHeader={true} />}>
        <div className="mb-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" text="Loading onboarding..." />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (onboarding.status === 'rejected') {
    return (
      <DashboardLayout sidebar={<OnboardingList currentOnboarding={onboarding} hideHeader={true} />}>
        <div className="mb-6">
          {alerts.map(alert => (
            <Alert key={alert.id} alert={alert} />
          ))}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-red-300">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-8 text-center">
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto bg-red-500 rounded-full flex items-center justify-center shadow-lg">
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h2
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
                style={{ color: '#0F5E7B' }}
              >
                Onboarding Rejected
              </h2>
              <p className="text-base sm:text-lg mb-6" style={{ color: '#576472' }}>
                {onboarding.review_reason
                  ? `This onboarding has been rejected. Reason: ${onboarding.review_reason}`
                  : 'This onboarding has been rejected.'}
              </p>
              <button
                onClick={() => navigate('/onboardings')}
                className="px-6 py-3 bg-[#0F5E7B] text-white rounded-lg text-base font-semibold hover:bg-[#0d4d66] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
              >
                Back to Onboardings
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (onboarding.status === 'approved') {
    return (
      <DashboardLayout sidebar={<OnboardingList currentOnboarding={onboarding} hideHeader={true} />}>
        <div className="mb-6">
          {alerts.map(alert => (
            <Alert key={alert.id} alert={alert} />
          ))}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-green-300">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-8 text-center">
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
              <h2
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
                style={{ color: '#0F5E7B' }}
              >
                Onboarding Approved
              </h2>
              <p className="text-base sm:text-lg mb-6" style={{ color: '#576472' }}>
                Congratulations! Your onboarding has been approved successfully.
              </p>
              <button
                onClick={() => navigate('/onboardings')}
                className="px-6 py-3 bg-[#0F5E7B] text-white rounded-lg text-base font-semibold hover:bg-[#0d4d66] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
              >
                Back to Onboardings
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (onboarding.status === 'pending_review') {
    return (
      <DashboardLayout sidebar={<OnboardingList currentOnboarding={onboarding} hideHeader={true} />}>
        <div className="mb-6">
          {alerts.map(alert => (
            <Alert key={alert.id} alert={alert} />
          ))}
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
                Your onboarding has been submitted successfully and is now pending review. You will
                be notified once it has been reviewed.
              </p>
              <button
                onClick={() => navigate('/onboardings')}
                className="px-6 py-3 bg-[#0F5E7B] text-white rounded-lg text-base font-semibold hover:bg-[#0d4d66] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
              >
                Back to Onboardings
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (
    onboardingComplete ||
    onboarding.status === 'completed' ||
    onboarding.status === 'COMPLETED'
  ) {
    return (
      <DashboardLayout sidebar={<OnboardingList currentOnboarding={onboarding} hideHeader={true} />}>
        <div className="mb-6">
          {alerts.map(alert => (
            <Alert key={alert.id} alert={alert} />
          ))}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-green-300">
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
                Thank you for completing the onboarding process. Your information has been submitted
                and will be reviewed.
              </p>
              <button
                onClick={() => navigate('/onboardings')}
                className="px-6 py-3 bg-[#0F5E7B] text-white rounded-lg text-base font-semibold hover:bg-[#0d4d66] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
              >
                Back to Onboardings
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (onboardingSteps.length === 0) {
    return (
      <DashboardLayout sidebar={<OnboardingList currentOnboarding={onboarding} hideHeader={true} />}>
        <div className="mb-6">
          {alerts.map(alert => (
            <Alert key={alert.id} alert={alert} />
          ))}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-gray-100">
            <p className="text-lg font-semibold mb-2" style={{ color: '#0F5E7B' }}>
              No steps available
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Unable to load onboarding steps. Please try again.
            </p>
            <button
              onClick={() => navigate('/onboardings')}
              className="px-6 py-3 bg-[#0F5E7B] text-white rounded-lg text-base font-semibold hover:bg-[#0d4d66] transition-all duration-200"
            >
              Back to Onboardings
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const completedSteps = new Set()
  if (onboarding && onboardingSteps.length > 0) {
    const completedCount = onboarding.completed_steps || 0
    for (let i = 1; i <= completedCount; i++) {
      completedSteps.add(i)
    }
  }

  const validCurrentStepOrder = Math.max(
    1,
    Math.min(currentStepOrder || stepOrder || 1, onboardingSteps.length)
  )

  return (
    <DashboardLayout sidebar={<OnboardingList currentOnboarding={onboarding} hideHeader={true} />}>
      <div className="mb-6">
        {alerts.map(alert => (
          <Alert key={alert.id} alert={alert} />
        ))}

        <div className="bg-white rounded-xl shadow-lg mb-4 sm:mb-6 border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-50 to-yellow-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight"
                    style={{ color: '#0F5E7B' }}
                  >
                    {onboarding.onboarding_title?.replace(/\d+$/, '').trim() || 'Onboarding'}
                  </h3>
                  <p className="text-xs sm:text-sm mt-1" style={{ color: '#576472' }}>
                    Step {validCurrentStepOrder} of{' '}
                    {onboarding.total_steps || onboardingSteps.length}
                    {isReadOnly && ' (View Only)'}
                  </p>
                </div>
              </div>
              <div className="self-start sm:self-auto">
                <StatusBadge status={onboarding.status} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="lg:hidden mb-4">
            <StepIndicator
              totalSteps={onboarding.total_steps || onboardingSteps.length}
              currentStepOrder={validCurrentStepOrder}
              completedSteps={completedSteps}
              steps={onboardingSteps}
              horizontal={true}
            />
          </div>

          <div className="mt-4 sm:mt-6 lg:mt-0">
            <MultiStepForm
              steps={onboardingSteps}
              onboardingId={onboarding.id}
              onSubmitStep={handleStepSubmit}
              onStepComplete={handleStepComplete}
              onStepBack={handleStepBack}
              onSubmit={handleFinalSubmit}
              totalSteps={onboarding.total_steps || onboardingSteps.length}
              currentStepOrder={validCurrentStepOrder}
              initialValues={formData}
              onFormDataChange={handleFormDataChange}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default OnboardingDetailPage
