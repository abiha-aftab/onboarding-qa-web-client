function StepIndicator({
  totalSteps,
  currentStepOrder,
  completedSteps,
  steps,
  horizontal = false,
}) {
  // Horizontal layout for mobile
  if (horizontal) {
    return (
      <div className="bg-gradient-to-r from-cyan-50 to-yellow-50 rounded-lg px-3 py-3 border-2 border-gray-200">
        <div className="flex items-center justify-between gap-2">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepOrder = i + 1
            const step = steps?.find(s => (s.order || s.step_number) === stepOrder)
            const isCompleted = completedSteps.has(stepOrder)
            const isActive = stepOrder === currentStepOrder

            return (
              <div key={stepOrder} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 flex-shrink-0 ${
                      isCompleted
                        ? 'bg-[#FFD350] text-[#0F5E7B] shadow-md'
                        : isActive
                          ? 'bg-[#0F5E7B] text-white shadow-lg scale-110'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      stepOrder
                    )}
                  </div>
                  {step && (
                    <span
                      className={`text-xs font-semibold mt-1 text-center truncate max-w-[60px] ${
                        isActive
                          ? 'text-[#0F5E7B]'
                          : isCompleted
                            ? 'text-[#0F5E7B]'
                            : 'text-gray-400'
                      }`}
                      title={step.title}
                    >
                      {step.title}
                    </span>
                  )}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 transition-all duration-300 ${
                      isCompleted || stepOrder < currentStepOrder ? 'bg-[#FFD350]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Vertical layout for desktop (sidebar)
  return (
    <div className="bg-gradient-to-b from-cyan-50 to-yellow-50 rounded-lg px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200">
      <div className="flex flex-col space-y-3 sm:space-y-4">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepOrder = i + 1
          const step = steps?.find(s => (s.order || s.step_number) === stepOrder)
          const isCompleted = completedSteps.has(stepOrder)
          const isActive = stepOrder === currentStepOrder

          const stepTitle = step ? step.title : `Step ${stepOrder}`

          return (
            <div key={stepOrder} className="flex items-start">
              <div className="flex flex-col items-center mr-2 sm:mr-3">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 flex-shrink-0 ${
                    isCompleted
                      ? 'bg-[#FFD350] text-[#0F5E7B] shadow-md'
                      : isActive
                        ? 'bg-[#0F5E7B] text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepOrder
                  )}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-1 flex-1 min-h-[30px] sm:min-h-[40px] mt-2 transition-all duration-300 ${
                      isCompleted || stepOrder < currentStepOrder ? 'bg-[#FFD350]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pt-0.5 sm:pt-1 min-w-0">
                <span
                  className={`text-xs sm:text-sm font-semibold block truncate ${
                    isActive ? 'text-[#0F5E7B]' : isCompleted ? 'text-[#0F5E7B]' : 'text-gray-400'
                  }`}
                >
                  {stepTitle}
                </span>
                {isActive && <span className="text-xs text-gray-500 mt-1 block">Current step</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StepIndicator
