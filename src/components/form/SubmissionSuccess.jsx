function SubmissionSuccess({ steps, submittedValues, formatValueForDisplay }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-cyan-50 px-4 sm:px-6 py-6 sm:py-8 text-center">
        <div className="mb-3 sm:mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 text-white"
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
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 break-words"
          style={{ color: '#0F5E7B' }}
        >
          Form Submitted Successfully!
        </h2>
        <p
          className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 px-2"
          style={{ color: '#576472' }}
        >
          We've received your responses. We will process them and reach out to you soon.
        </p>

        {submittedValues && (
          <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 max-w-2xl mx-auto px-2 sm:px-0">
            {steps.map(step => {
              const sortedQuestions = [...(step.step_questions || [])].sort(
                (a, b) => (a.order || 0) - (b.order || 0)
              )

              return (
                <div
                  key={step.id}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border-2 border-[#FFD350]"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFD350] flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        style={{ color: '#0F5E7B' }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="font-bold text-base sm:text-lg" style={{ color: '#0F5E7B' }}>
                      {step.title}
                    </h3>
                  </div>

                  {sortedQuestions.length > 0 && (
                    <div className="ml-9 sm:ml-11 space-y-1.5 sm:space-y-2">
                      {sortedQuestions.map((stepQuestion, idx) => {
                        const question = stepQuestion?.question
                        if (!question) return null
                        const key = `question_${question.id}`
                        const value = submittedValues[key]
                        return (
                          <div key={question.id ?? `q_${idx}`} className="text-xs sm:text-sm">
                            <span className="font-semibold" style={{ color: '#576472' }}>
                              {question.question_text}:
                            </span>
                            <span className="ml-1 sm:ml-2" style={{ color: '#0F5E7B' }}>
                              {formatValueForDisplay(value, question.answer_type)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SubmissionSuccess
