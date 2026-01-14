import { useMemo, useState, useCallback, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import DynamicField from './DynamicField';

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
}) {
  const normalizedSteps = useMemo(() => {
    if (!steps) return [];
    const stepsArray = Array.isArray(steps) ? steps : [steps];
    return [...stepsArray].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [steps]);

  const [currentStepOrder, setCurrentStepOrder] = useState(propCurrentStepOrder || 1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedValues, setSubmittedValues] = useState(null);

  // Find current step by order
  const currentStep = normalizedSteps.find(s => s.order === currentStepOrder) || normalizedSteps[0];
  const currentStepIndex = normalizedSteps.findIndex(s => s.order === currentStepOrder);
  const isFirstStep = currentStepOrder === 1;
  // Only show Submit on Step 3, show Next for Steps 1 and 2
  const isLastStep = currentStepOrder === totalSteps;
  
  const sortedStepQuestions = useMemo(() => {
    if (!currentStep) return [];
    return [...(currentStep.step_questions || [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
  }, [currentStep]);
  
  const hasQuestions = sortedStepQuestions.length > 0;

  // Sync currentStepOrder with props if provided
  useEffect(() => {
    if (propCurrentStepOrder !== undefined && propCurrentStepOrder !== currentStepOrder) {
      setCurrentStepOrder(propCurrentStepOrder);
    }
  }, [propCurrentStepOrder]);

  // Sync when steps are loaded
  useEffect(() => {
    if (normalizedSteps.length > 0) {
      const stepForOrder = normalizedSteps.find(s => s.order === currentStepOrder);
      if (!stepForOrder && normalizedSteps.length > 0) {
        // If current step order doesn't exist, find the closest one
        const availableOrders = normalizedSteps.map(s => s.order).sort((a, b) => a - b);
        const closestOrder = availableOrders.find(o => o >= currentStepOrder) || availableOrders[availableOrders.length - 1];
        if (closestOrder !== currentStepOrder) {
          setCurrentStepOrder(closestOrder);
        }
      }
    }
  }, [normalizedSteps, currentStepOrder]);

  const initialValues = useMemo(() => {
    if (providedInitialValues) {
      return providedInitialValues;
    }

    const values = {};
    normalizedSteps.forEach((step) => {
      const sortedQuestions = [...(step.step_questions || [])].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );

      sortedQuestions.forEach((stepQuestion) => {
        const question = stepQuestion.question;
        const key = `question_${question.id}`;

        switch (question.answer_type) {
          case 'boolean':
            values[key] = false;
            break;
          case 'number':
            values[key] = '';
            break;
          case 'file':
            values[key] = null;
            break;
          default:
            values[key] = '';
        }
      });
    });

    return values;
  }, [normalizedSteps, providedInitialValues]);

  const currentStepValidationSchema = useMemo(() => {
    if (!currentStep) return Yup.object({});

    const schema = {};
    const sortedQuestions = [...(currentStep.step_questions || [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    sortedQuestions.forEach((stepQuestion) => {
      const question = stepQuestion.question;
      const key = `question_${question.id}`;
      const isRequired = question.is_required || stepQuestion.is_required;

      let fieldSchema;

      switch (question.answer_type) {
        case 'text':
          fieldSchema = Yup.string().trim();
          break;
        case 'number':
          fieldSchema = Yup.number()
            .nullable()
            .transform((value, originalValue) => {
              return originalValue === '' ? null : value;
            });
          break;
        case 'date':
          fieldSchema = Yup.date().nullable();
          break;
        case 'boolean':
          fieldSchema = Yup.boolean();
          break;
        case 'file':
          fieldSchema = Yup.mixed().nullable();
          break;
        default:
          fieldSchema = Yup.string().trim();
      }

      if (isRequired) {
        if (question.answer_type === 'boolean') {
          fieldSchema = fieldSchema.oneOf([true], 'This field is required');
        } else if (question.answer_type === 'file') {
          fieldSchema = fieldSchema.required('Please select a file');
        } else {
          fieldSchema = fieldSchema.required('This field is required');
        }
      }

      schema[key] = fieldSchema;
    });

    return Yup.object(schema);
  }, [currentStep]);

  const handleNext = useCallback(
    async (validateForm, setTouched, setErrors, values, existingErrors, setSubmitting) => {
      try {
        // Validate form first
        await currentStepValidationSchema.validate(values, { abortEarly: false });

        // Mark fields as touched
        const touchedFields = {};
        sortedStepQuestions.forEach((stepQuestion) => {
          const question = stepQuestion.question;
          touchedFields[`question_${question.id}`] = true;
        });
        setTouched(touchedFields);

        // Clear errors
        const updatedErrors = { ...existingErrors };
        sortedStepQuestions.forEach((stepQuestion) => {
          delete updatedErrors[`question_${stepQuestion.question.id}`];
        });
        setErrors(updatedErrors);

        // Submit current step to backend BEFORE moving forward
        setSubmitting(true);
        try {
          if (onSubmitStep && onboardingId && currentStep?.id && hasQuestions) {
            await onSubmitStep(onboardingId, currentStep.id, values, sortedStepQuestions);
          }
          
          // Mark step as completed by order
          const newCompletedSteps = new Set([...completedSteps, currentStepOrder]);
          setCompletedSteps(newCompletedSteps);

          // Call onStepComplete callback - this will fetch the next step
          if (onStepComplete) {
            await onStepComplete(currentStepIndex, currentStep, values);
          }

          // Move to next step after submission succeeds
          const nextStepOrder = currentStepOrder + 1;
          if (nextStepOrder <= totalSteps) {
            // Wait a bit for the next step to be loaded
            setTimeout(() => {
              const nextStep = normalizedSteps.find(s => s.order === nextStepOrder);
              if (nextStep) {
                setCurrentStepOrder(nextStepOrder);
                const nextIndex = normalizedSteps.indexOf(nextStep);
                if (onStepChange) {
                  onStepChange(nextIndex, nextStep);
                }
              } else {
                // Step not loaded yet, but we'll wait for it via useEffect
                setCurrentStepOrder(nextStepOrder);
              }
            }, 200);
          }
        } catch (submitError) {
          // Handle submission error
          console.error('Error submitting step:', submitError);
          const errorMessage = submitError?.data?.detail || submitError?.message || 'Failed to submit step. Please try again.';
          setErrors({ ...updatedErrors, _submit: errorMessage });
          throw submitError;
        } finally {
          setSubmitting(false);
        }
      } catch (validationErrors) {
        // Handle validation errors
        const touchedFields = {};
        const updatedErrors = { ...existingErrors };
        sortedStepQuestions.forEach((stepQuestion) => {
          const question = stepQuestion.question;
          const key = `question_${question.id}`;
          touchedFields[key] = true;

          if (validationErrors.inner) {
            const fieldError = validationErrors.inner.find((err) => err.path === key);
            if (fieldError) {
              updatedErrors[key] = fieldError.message;
            } else {
              delete updatedErrors[key];
            }
          }
        });

        setTouched(touchedFields);
        setErrors(updatedErrors);
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
      hasQuestions,
      sortedStepQuestions,
      totalSteps,
      currentStepIndex,
    ]
  );

  const handleBack = useCallback(() => {
    const prevOrder = Math.max(currentStepOrder - 1, 1);
    setCurrentStepOrder(prevOrder);
    
    const prevStep = normalizedSteps.find(s => s.order === prevOrder);
    if (prevStep && onStepChange) {
      const prevIndex = normalizedSteps.indexOf(prevStep);
      onStepChange(prevIndex, prevStep);
    }
  }, [currentStepOrder, normalizedSteps, onStepChange]);

  const handleSubmit = useCallback(
    async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        
        // Submit Step 3 (final step) to backend
        if (onSubmitStep && onboardingId && currentStep?.id) {
          // Step 3 might have no questions (completion step)
          if (hasQuestions && sortedStepQuestions.length > 0) {
            await onSubmitStep(onboardingId, currentStep.id, values, sortedStepQuestions);
          } else {
            // Submit empty response for completion step
            await onSubmitStep(onboardingId, currentStep.id, {}, []);
          }
        }

        setCompletedSteps((prev) => new Set([...prev, currentStepOrder]));

        if (onStepComplete) {
          onStepComplete(currentStepIndex, currentStep, values);
        }

        const formData = { ...values };

        if (onSubmit) {
          await Promise.resolve(onSubmit(formData));
        }

        setIsSubmitted(true);
        setSubmittedValues(formData);
      } catch (error) {
        console.error('Error submitting final form:', error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [currentStepOrder, currentStep, onSubmit, onStepComplete, onSubmitStep, onboardingId, hasQuestions, sortedStepQuestions]
  );

  const formatValueForDisplay = useCallback((value, answerType) => {
    if (value === null || value === undefined || value === '') return 'Not provided';
    if (answerType === 'boolean') return value ? 'Yes' : 'No';
    if (answerType === 'file') return value?.name || 'File selected';
    if (answerType === 'date') {
      try {
        const date = new Date(value);
        return date.toLocaleDateString();
      } catch {
        return String(value);
      }
    }
    return String(value);
  }, []);

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-cyan-50 px-6 py-8 text-center">
          <div className="mb-4">
            <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#0F5E7B' }}>
            Form Submitted Successfully!
          </h2>
          <p className="text-lg mb-6" style={{ color: '#576472' }}>
            We've received your responses. We will process them and reach out to you soon.
          </p>

          {submittedValues && (
            <div className="mt-8 space-y-4 max-w-2xl mx-auto">
              {normalizedSteps.map((step) => {
                const sortedQuestions = [...(step.step_questions || [])].sort(
                  (a, b) => (a.order || 0) - (b.order || 0)
                );

                return (
                  <div key={step.id} className="bg-white rounded-lg p-4 shadow-sm border-2 border-[#FFD350]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFD350] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" style={{ color: '#0F5E7B' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-lg" style={{ color: '#0F5E7B' }}>{step.title}</h3>
                    </div>

                    {sortedQuestions.length > 0 && (
                      <div className="ml-11 space-y-2">
                        {sortedQuestions.map((stepQuestion) => {
                          const question = stepQuestion.question;
                          const key = `question_${question.id}`;
                          const value = submittedValues[key];
                          return (
                            <div key={question.id} className="text-sm">
                              <span className="font-semibold" style={{ color: '#576472' }}>
                                {question.question_text}:
                              </span>
                              <span className="ml-2" style={{ color: '#0F5E7B' }}>
                                {formatValueForDisplay(value, question.answer_type)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentStep || normalizedSteps.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-center" style={{ color: '#0F5E7B' }}>
          No steps available
        </p>
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={currentStepValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
    >
      {({ validateForm, setTouched, setErrors, isSubmitting, values, errors, touched, setSubmitting }) => {
        const currentStepHasErrors = hasQuestions && sortedStepQuestions.some((stepQuestion) => {
          const question = stepQuestion.question;
          const key = `question_${question.id}`;
          return touched[key] && errors[key];
        });

        return (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-50 to-yellow-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {Array.from({ length: totalSteps }, (_, i) => {
                  const stepOrder = i + 1;
                  const step = normalizedSteps.find(s => s.order === stepOrder);
                  const isCompleted = completedSteps.has(stepOrder);
                  const isActive = stepOrder === currentStepOrder;

                  const stepTitle = step ? step.title : `Step ${stepOrder}`;
                  
                  return (
                    <div key={stepOrder} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                            isCompleted
                              ? 'bg-[#FFD350] text-[#0F5E7B] shadow-md'
                              : isActive
                              ? 'bg-[#0F5E7B] text-white shadow-lg scale-110'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            stepOrder
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold mt-2 text-center max-w-[80px] ${
                            isActive ? 'text-[#0F5E7B]' : isCompleted ? 'text-[#0F5E7B]' : 'text-gray-400'
                          }`}
                        >
                          {stepTitle}
                        </span>
                      </div>

                      {i < totalSteps - 1 && (
                        <div
                          className={`flex-1 h-1 mx-2 mt-[-20px] transition-all duration-300 ${
                            isCompleted || stepOrder < currentStepOrder
                              ? 'bg-[#FFD350]'
                              : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Form className="p-6 relative">
              {isSubmitting && (
                <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <svg className="animate-spin h-10 w-10 mx-auto mb-3" style={{ color: '#0F5E7B' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-base font-semibold" style={{ color: '#0F5E7B' }}>Submitting...</p>
                  </div>
                </div>
              )}

              {completedSteps.size > 0 && currentStepOrder > 1 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-cyan-50 to-yellow-50 rounded-lg border-2 border-[#FFD350]">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#0F5E7B' }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Completed Steps Summary
                  </h3>
                  <div className="space-y-2">
                    {Array.from(completedSteps).sort().map((completedOrder) => {
                      const completedStep = normalizedSteps.find(s => s.order === completedOrder);
                      if (!completedStep) return null;
                      return (
                        <div key={completedStep.id} className="text-sm">
                          <span className="font-semibold" style={{ color: '#0F5E7B' }}>
                            {completedStep.title}:
                          </span>
                          <span className="ml-2 text-gray-600">
                            {completedStep.step_questions?.slice(0, 2).map((sq, idx) => {
                              const q = sq.question;
                              const key = `question_${q.id}`;
                              const value = values[key];
                              return (
                                <span key={q.id}>
                                  {idx > 0 && ', '}
                                  {formatValueForDisplay(value, q.answer_type)}
                                </span>
                              );
                            })}
                            {completedStep.step_questions?.length > 2 && '...'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#0F5E7B' }}>
                  {currentStep.title}
                </h2>
                <p className="text-sm" style={{ color: '#576472' }}>
                  Step {currentStepOrder} of {totalSteps}
                </p>
              </div>

              <div className="space-y-6 mb-6">
                {sortedStepQuestions.map((stepQuestion) => {
                  const question = stepQuestion.question;
                  return (
                    <DynamicField
                      key={`${currentStep.id}_${question.id}`}
                      question={question}
                    />
                  );
                })}
              </div>

              <div className={`flex ${isFirstStep ? 'justify-end' : 'justify-between'} items-center pt-6 border-t border-gray-200`}>
                {!isFirstStep && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 flex items-center gap-2 ${
                      isSubmitting
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-gray-100 text-[#0F5E7B] hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                )}

                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={() => handleNext(validateForm, setTouched, setErrors, values, errors, setSubmitting)}
                    disabled={isSubmitting || currentStepHasErrors}
                    className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 flex items-center gap-2 ${
                      isSubmitting || currentStepHasErrors
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-[#0F5E7B] text-white hover:bg-[#0d4d66] hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        Next
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || (hasQuestions && currentStepHasErrors)}
                    className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                      isSubmitting || (hasQuestions && currentStepHasErrors)
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </Form>
          </div>
        );
      }}
    </Formik>
  );
}

export default MultiStepForm;
