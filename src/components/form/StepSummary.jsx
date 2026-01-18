function StepSummary({ completedSteps, steps, values, formatValueForDisplay }) {
  if (completedSteps.size === 0) {
    return null
  }

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-cyan-50 to-yellow-50 rounded-lg border-2 border-[#FFD350]">
      <h3 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2" style={{ color: '#0F5E7B' }}>
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="hidden sm:inline">Completed Steps Summary</span>
        <span className="sm:hidden">Summary</span>
      </h3>
      <div className="space-y-1.5 sm:space-y-2">
        {Array.from(completedSteps)
          .sort()
          .map((completedOrder) => {
            const completedStep = steps.find((s) => s.order === completedOrder)
            if (!completedStep) return null
            return (
              <div key={completedStep.id} className="text-xs sm:text-sm">
                <span className="font-semibold" style={{ color: '#0F5E7B' }}>
                  {completedStep.title}:
                </span>
                <span className="ml-1 sm:ml-2 text-gray-600">
                  {completedStep.step_questions?.slice(0, 2).map((sq, idx) => {
                    const q = sq?.question
                    if (!q) return null
                    const key = `question_${q.id}`
                    const value = values[key]
                    return (
                      <span key={q.id ?? `q_${idx}`}>
                        {idx > 0 && ', '}
                        {formatValueForDisplay(value, q.answer_type)}
                      </span>
                    )
                  })}
                  {completedStep.step_questions?.length > 2 && '...'}
                </span>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default StepSummary
