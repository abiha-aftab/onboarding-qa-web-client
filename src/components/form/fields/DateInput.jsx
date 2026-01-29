import QuestionLabel from '../QuestionLabel'

function DateInput({
  field,
  meta,
  fieldName,
  question,
  handleChange,
  baseInputClasses,
  inputStyle,
  readOnly = false,
}) {
  // Format date value for input (YYYY-MM-DD format required)
  const formatDateValue = value => {
    if (!value) return ''
    if (typeof value === 'string') {
      // If it's already in YYYY-MM-DD format, use it
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
      // If it includes time, extract date part
      if (value.includes('T')) return value.split('T')[0]
      // Try to parse and format
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    }
    return ''
  }

  const handleFocus = e => {
    // Ensure date picker opens on focus/click
    e.target.showPicker?.()
  }

  return (
    <div className="space-y-2 relative" style={{ zIndex: 1 }}>
      <QuestionLabel htmlFor={fieldName} required={question.is_required}>
        {question.question_text}
      </QuestionLabel>
      <input
        type="date"
        id={fieldName}
        name={fieldName}
        value={formatDateValue(field.value)}
        onChange={handleChange}
        onBlur={field.onBlur}
        onFocus={readOnly ? undefined : handleFocus}
        onClick={readOnly ? undefined : handleFocus}
        className={`${baseInputClasses} ${readOnly ? 'bg-gray-100' : ''}`}
        style={{ ...inputStyle, position: 'relative', zIndex: 10 }}
        disabled={readOnly}
        readOnly={readOnly}
        aria-required={question.is_required}
        aria-invalid={meta.touched && meta.error ? 'true' : 'false'}
        aria-describedby={meta.touched && meta.error ? `${fieldName}-error` : undefined}
      />
      {meta.touched && meta.error && (
        <div
          id={`${fieldName}-error`}
          className="text-sm text-red-600 mt-1"
          role="alert"
          aria-live="polite"
        >
          {meta.error}
        </div>
      )}
    </div>
  )
}

export default DateInput
