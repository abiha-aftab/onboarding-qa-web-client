function QuestionLabel({ htmlFor, required, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm sm:text-base font-semibold tracking-tight"
      style={{ color: '#0F5E7B' }}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  )
}

export default QuestionLabel
