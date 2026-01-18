import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import StepHeader from './form/StepHeader'
import StepSummary from './form/StepSummary'
import QuestionList from './form/QuestionList'
import FormActions from './form/FormActions'
import SubmissionSuccess from './form/SubmissionSuccess'
import LoadingSpinner from './ui/LoadingSpinner'

function MultiStepForm({
  steps,
  onSubmit,
  onSubmitStep,
  initialValues: providedInitialValues,
  onStepChange,
  onStepComplete,
  onboardingId,
  totalSteps = 3,
  currentStepOrder: propCurrentStepOrder,
  onFormDataChange,
  readOnly = false,
}) {
  const normalizedSteps = useMemo(() => {
    if (!steps) return []
    const stepsArray = Array.isArray(steps) ? steps : [steps]
    // Map step_number to order for consistency (backend uses step_number, frontend uses order)
    return [...stepsArray]
      .map(step => ({
        ...step,
        order: step.order || step.step_number || 0,
      }))
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [steps])

  const [currentStepOrder, setCurrentStepOrder] = useState(propCurrentStepOrder || 1)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedValues, setSubmittedValues] = useState(null)

  // Find current step by order (support both order and step_number)
  const currentStep =
    normalizedSteps.find(s => (s.order || s.step_number) === currentStepOrder) || normalizedSteps[0]
  const currentStepIndex = normalizedSteps.findIndex(
    s => (s.order || s.step_number) === currentStepOrder
  )
  const isFirstStep = currentStepOrder === 1
  // Only show Submit on Step 3, show Next for Steps 1 and 2
  const isLastStep = currentStepOrder === totalSteps

  const sortedStepQuestions = useMemo(() => {
    if (!currentStep) return []
    return [...(currentStep.step_questions || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [currentStep])

  const hasQuestions = sortedStepQuestions.length > 0

  // Sync currentStepOrder with props if provided (only when prop changes, not when state changes)
  const prevPropStepOrderRef = useRef(propCurrentStepOrder)
  useEffect(() => {
    // Only sync if the prop actually changed (not when currentStepOrder changes)
    if (
      propCurrentStepOrder !== undefined &&
      propCurrentStepOrder !== prevPropStepOrderRef.current
    ) {
      const stepExists = normalizedSteps.some(s => s.order === propCurrentStepOrder)
      if (stepExists) {
        setCurrentStepOrder(propCurrentStepOrder)
      }
      prevPropStepOrderRef.current = propCurrentStepOrder
    }
  }, [propCurrentStepOrder, normalizedSteps])

  // Sync when steps are loaded
  useEffect(() => {
    if (normalizedSteps.length > 0) {
      const stepForOrder = normalizedSteps.find(
        s => (s.order || s.step_number) === currentStepOrder
      )
      if (!stepForOrder && normalizedSteps.length > 0) {
        // If current step order doesn't exist, find the closest one
        const availableOrders = normalizedSteps
          .map(s => s.order || s.step_number)
          .sort((a, b) => a - b)
        const closestOrder =
          availableOrders.find(o => o >= currentStepOrder) ||
          availableOrders[availableOrders.length - 1]
        if (closestOrder !== currentStepOrder) {
          setCurrentStepOrder(closestOrder)
        }
      }
    }
  }, [normalizedSteps, currentStepOrder])

  // Navigate to next step when it becomes available in normalizedSteps
  // This handles the case where fetchNextStep loads a new step
  useEffect(() => {
    if (propCurrentStepOrder !== undefined) {
      const stepForPropOrder = normalizedSteps.find(s => s.order === propCurrentStepOrder)
      if (stepForPropOrder) {
        // Step exists in normalizedSteps
        if (propCurrentStepOrder !== currentStepOrder) {
          // Navigate to the step specified by Redux
          setCurrentStepOrder(propCurrentStepOrder)
          const stepIndex = normalizedSteps.indexOf(stepForPropOrder)
          if (onStepChange) {
            onStepChange(stepIndex, stepForPropOrder)
          }
        }
      }
    }
  }, [normalizedSteps, propCurrentStepOrder, currentStepOrder, onStepChange])

  const initialValues = useMemo(() => {
    // Start with provided initial values from parent (formData) or empty object
    // Create a new object copy to avoid modifying frozen/sealed objects from Redux
    const baseValues = providedInitialValues ? { ...providedInitialValues } : {}

    // Ensure all questions have default values for ALL steps (so data persists across navigation)
    // Also populate from user_answer if available
    normalizedSteps.forEach(step => {
      const sortedQuestions = [...(step.step_questions || [])].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      )

      sortedQuestions.forEach(stepQuestion => {
        const question = stepQuestion.question
        const key = `question_${question.id}`

        // If value already exists in baseValues, keep it (user input takes precedence)
        if (key in baseValues) {
          return
        }

        // Check if there's a user_answer from the backend
        const userAnswer = stepQuestion.user_answer
        if (userAnswer) {
          // Populate from user_answer based on answer type
          switch (question.answer_type) {
            case 'text':
              baseValues[key] = userAnswer.answer_text || ''
              break
            case 'number':
              baseValues[key] = userAnswer.answer_number || ''
              break
            case 'date':
              baseValues[key] = userAnswer.answer_date || ''
              break
            case 'boolean':
              baseValues[key] = userAnswer.answer_boolean ?? false
              break
            case 'file':
              // File answers are handled separately
              baseValues[key] = userAnswer.answer_text || null
              break
            default:
              baseValues[key] = userAnswer.answer_text || ''
          }
        } else {
          // No user_answer, set default based on type
          switch (question.answer_type) {
            case 'boolean':
              baseValues[key] = false
              break
            case 'number':
              baseValues[key] = ''
              break
            case 'file':
              baseValues[key] = null
              break
            default:
              baseValues[key] = ''
          }
        }
      })
    })

    return baseValues
  }, [normalizedSteps, providedInitialValues]) // Remove currentStepOrder dependency - parent manages state

  const currentStepValidationSchema = useMemo(() => {
    if (!currentStep) return Yup.object({})

    const schema = {}
    const sortedQuestions = [...(currentStep.step_questions || [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    )

    sortedQuestions.forEach(stepQuestion => {
      const question = stepQuestion.question
      const key = `question_${question.id}`
      const isRequired = question.is_required || stepQuestion.is_required

      // Skip file questions - they require separate document endpoint upload
      if (question.answer_type === 'file') {
        // File questions are optional for now (handled via separate endpoint)
        return
      }

      let fieldSchema

      switch (question.answer_type) {
        case 'text':
          fieldSchema = Yup.string().trim()
          break
        case 'number':
          fieldSchema = Yup.number()
            .nullable()
            .transform((value, originalValue) => {
              return originalValue === '' ? null : value
            })
          break
        case 'date':
          fieldSchema = Yup.date().nullable()
          break
        case 'boolean':
          fieldSchema = Yup.boolean()
          break
        default:
          fieldSchema = Yup.string().trim()
      }

      if (isRequired) {
        if (question.answer_type === 'boolean') {
          fieldSchema = fieldSchema.oneOf([true], 'This field is required')
        } else {
          fieldSchema = fieldSchema.required('This field is required')
        }
      }

      schema[key] = fieldSchema
    })

    return Yup.object(schema)
  }, [currentStep])

  const handleNext = useCallback(
    async (validateForm, setTouched, setErrors, values, existingErrors, setSubmitting) => {
      try {
        // Validate form first
        await currentStepValidationSchema.validate(values, { abortEarly: false })

        // Mark fields as touched
        const touchedFields = {}
        sortedStepQuestions.forEach(stepQuestion => {
          const question = stepQuestion.question
          touchedFields[`question_${question.id}`] = true
        })
        setTouched(touchedFields)

        // Clear errors
        const updatedErrors = { ...existingErrors }
        sortedStepQuestions.forEach(stepQuestion => {
          delete updatedErrors[`question_${stepQuestion.question.id}`]
        })
        setErrors(updatedErrors)

        // Save current form values to parent state before moving forward
        if (onFormDataChange) {
          onFormDataChange(values)
        }

        // Submit current step to backend BEFORE moving forward
        setSubmitting(true)
        try {
          // Always submit step, even if it has no questions (to mark step as complete)
          if (onSubmitStep && onboardingId && currentStep?.id) {
            await onSubmitStep(onboardingId, currentStep.id, values, sortedStepQuestions)
          }

          // Mark step as completed by order
          const newCompletedSteps = new Set([...completedSteps, currentStepOrder])
          setCompletedSteps(newCompletedSteps)

          // Call onStepComplete callback - all steps are already loaded
          const nextStepOrder = currentStepOrder + 1
          if (onStepComplete) {
            await onStepComplete(currentStepIndex, currentStep, values)
          }

          // Navigate to next step if available (all steps are already loaded)
          if (nextStepOrder <= totalSteps) {
            const nextStep = normalizedSteps.find(s => (s.order || s.step_number) === nextStepOrder)
            if (nextStep) {
              setCurrentStepOrder(nextStepOrder)
              const nextIndex = normalizedSteps.indexOf(nextStep)
              if (onStepChange) {
                onStepChange(nextIndex, nextStep)
              }
            }
          } else {
            // All steps completed - this will be handled by onStepComplete
          }
        } catch (submitError) {
          // Handle submission error
          console.error('Error submitting step:', submitError)
          const errorMessage =
            submitError?.data?.detail ||
            submitError?.message ||
            'Failed to submit step. Please try again.'
          setErrors({ ...updatedErrors, _submit: errorMessage })
          throw submitError
        } finally {
          setSubmitting(false)
        }
      } catch (validationErrors) {
        // Handle validation errors
        const touchedFields = {}
        const updatedErrors = { ...existingErrors }
        sortedStepQuestions.forEach(stepQuestion => {
          const question = stepQuestion.question
          const key = `question_${question.id}`
          touchedFields[key] = true

          if (validationErrors.inner) {
            const fieldError = validationErrors.inner.find(err => err.path === key)
            if (fieldError) {
              updatedErrors[key] = fieldError.message
            } else {
              delete updatedErrors[key]
            }
          }
        })

        setTouched(touchedFields)
        setErrors(updatedErrors)
      }
    },
    [
      currentStep,
      currentStepOrder,
      completedSteps,
      currentStepValidationSchema,
      normalizedSteps,
      onStepChange,
      onStepComplete,
      onSubmitStep,
      onboardingId,
      sortedStepQuestions,
      totalSteps,
      currentStepIndex,
      onFormDataChange,
    ]
  )

  const handleBack = useCallback(
    currentFormValues => {
      // Don't go back if already on first step
      if (currentStepOrder <= 1) {
        return
      }

      // Save current form values to parent state before going back
      if (currentFormValues && onFormDataChange) {
        onFormDataChange(currentFormValues)
      }

      const prevOrder = currentStepOrder - 1

      // Find the previous step (users can navigate back to any previous step)
      const prevStep = normalizedSteps.find(s => (s.order || s.step_number) === prevOrder)

      if (prevStep) {
        // Update step order - Formik will reinitialize with saved values from parent state
        setCurrentStepOrder(prevOrder)

        // Notify about step change
        const prevIndex = normalizedSteps.indexOf(prevStep)
        if (onStepChange) {
          onStepChange(prevIndex, prevStep)
        }
      }
    },
    [currentStepOrder, normalizedSteps, onStepChange, onFormDataChange]
  )

  const handleSubmit = useCallback(
    async (values, { setSubmitting, setErrors }) => {
      try {
        setSubmitting(true)

        // Save current form values to parent state before final submission
        if (onFormDataChange) {
          onFormDataChange(values)
        }

        // Submit Step 3 (final step) to backend
        // Always submit Step 3 to mark onboarding as complete, even if it has no questions
        if (onSubmitStep && onboardingId && currentStep?.id) {
          if (hasQuestions && sortedStepQuestions.length > 0) {
            // Verify we have values for all required questions
            const missingQuestions = sortedStepQuestions.filter(stepQuestion => {
              const question = stepQuestion.question
              const key = `question_${question.id}`
              const value = values[key]
              // Check if required question is missing
              const isRequired = question.is_required || stepQuestion.is_required
              if (isRequired) {
                if (question.answer_type === 'boolean') {
                  return value !== true
                } else if (question.answer_type === 'file') {
                  return !value || value === null
                } else {
                  return !value || value === '' || value === null
                }
              }
              return false
            })

            if (missingQuestions.length > 0) {
              const errors = {}
              missingQuestions.forEach(stepQuestion => {
                const question = stepQuestion.question
                errors[`question_${question.id}`] = 'This field is required'
              })
              setErrors(errors)
              setSubmitting(false)
              return
            }

            // Submit Step 3 with questions
            await onSubmitStep(onboardingId, currentStep.id, values, sortedStepQuestions)
          } else {
            // Step 3 has no questions - submit with empty responses to mark as complete
            await onSubmitStep(onboardingId, currentStep.id, {}, [])
          }
        }

        setCompletedSteps(prev => new Set([...prev, currentStepOrder]))

        // Save form data before calling onSubmit
        const formData = { ...values }

        // Call onSubmit which will refresh the sidebar status
        // Add a small delay to ensure backend has processed the status update
        if (onSubmit) {
          // Wait a bit for backend to update status
          await new Promise(resolve => setTimeout(resolve, 500))
          await Promise.resolve(onSubmit(formData))
        }

        // Also call onStepComplete if provided (for consistency)
        if (onStepComplete) {
          onStepComplete(currentStepIndex, currentStep, values)
        }

        setIsSubmitted(true)
        setSubmittedValues(formData)
      } catch (error) {
        console.error('Error submitting final form:', error)
        // Set form-level error if submission fails
        if (error?.data?.detail) {
          setErrors({ _submit: error.data.detail })
        } else if (error?.message) {
          setErrors({ _submit: error.message })
        } else {
          setErrors({ _submit: 'Failed to submit form. Please try again.' })
        }
        throw error
      } finally {
        setSubmitting(false)
      }
    },
    [
      currentStepOrder,
      currentStep,
      onSubmit,
      onStepComplete,
      onSubmitStep,
      onboardingId,
      hasQuestions,
      sortedStepQuestions,
      onFormDataChange,
      currentStepIndex,
    ]
  )

  const formatValueForDisplay = useCallback((value, answerType) => {
    if (value === null || value === undefined || value === '') return 'Not provided'
    if (answerType === 'boolean') return value ? 'Yes' : 'No'
    if (answerType === 'file') return value?.name || 'File selected'
    if (answerType === 'date') {
      try {
        const date = new Date(value)
        return date.toLocaleDateString()
      } catch {
        return String(value)
      }
    }
    return String(value)
  }, [])

  if (isSubmitted) {
    return (
      <SubmissionSuccess
        steps={normalizedSteps}
        submittedValues={submittedValues}
        formatValueForDisplay={formatValueForDisplay}
      />
    )
  }

  if (!currentStep || normalizedSteps.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-center" style={{ color: '#0F5E7B' }}>
          No steps available
        </p>
      </div>
    )
  }

  return (
    <Formik
      key={`onboarding-${onboardingId}-step-${currentStepOrder}`} // Stable key per onboarding/step combination
      initialValues={initialValues}
      validationSchema={currentStepValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
    >
      {({
        validateForm,
        setTouched,
        setErrors,
        isSubmitting,
        values,
        errors,
        touched,
        setSubmitting,
      }) => {
        // Note: Form values are saved to parent state only when navigating (Next/Back)
        // This prevents Formik reinitialization while user is typing
        // Values are preserved in Formik's internal state during typing
        const currentStepHasErrors =
          hasQuestions &&
          sortedStepQuestions.some(stepQuestion => {
            const question = stepQuestion.question
            const key = `question_${question.id}`
            return touched[key] && errors[key]
          })

        return (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <Form className="p-4 sm:p-6 relative" style={{ overflow: 'visible' }}>
              {isSubmitting && (
                <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center z-10">
                  <LoadingSpinner size="lg" text="Submitting..." />
                </div>
              )}

              <StepSummary
                completedSteps={completedSteps}
                steps={normalizedSteps}
                values={values}
                formatValueForDisplay={formatValueForDisplay}
              />

              <StepHeader
                title={currentStep.title}
                currentStepOrder={currentStepOrder}
                totalSteps={totalSteps}
              />

              {errors._submit && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-red-800 font-semibold">{errors._submit}</span>
                  </div>
                </div>
              )}

              <QuestionList
                questions={sortedStepQuestions}
                stepId={currentStep.id}
                readOnly={readOnly}
              />

              {!readOnly && (
                <FormActions
                  isFirstStep={isFirstStep}
                  isLastStep={isLastStep}
                  isSubmitting={isSubmitting}
                  hasErrors={hasQuestions && currentStepHasErrors}
                  onBack={() => handleBack(values)}
                  onNext={() =>
                    handleNext(validateForm, setTouched, setErrors, values, errors, setSubmitting)
                  }
                />
              )}
            </Form>
          </div>
        )
      }}
    </Formik>
  )
}

export default MultiStepForm
