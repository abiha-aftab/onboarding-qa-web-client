function FormActions({ isFirstStep, isLastStep, isSubmitting, hasErrors, onBack, onNext }) {
  return (
    <div
      className={`flex ${isFirstStep ? 'justify-end' : 'justify-between'} items-center pt-4 sm:pt-6 border-t border-gray-200 gap-2 sm:gap-4`}
    >
      {!isFirstStep && (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 flex-1 sm:flex-initial ${
            isSubmitting
              ? 'bg-gray-200 text-gray-400'
              : 'bg-black text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <span>Back</span>
        </button>
      )}

      {!isLastStep ? (
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting || hasErrors}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold shadow-md transition-all duration-200 flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial ${
            isSubmitting || hasErrors
              ? 'bg-gray-200 text-gray-400'
              : 'bg-[#0F5E7B] text-white hover:bg-[#0d4d66] hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="hidden sm:inline">Submitting...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </>
          )}
        </button>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting || hasErrors}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 w-full sm:w-auto ${
            isSubmitting || hasErrors
              ? 'bg-gray-200 text-gray-400'
              : 'bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="hidden sm:inline">Submitting...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <span>Submit</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default FormActions
