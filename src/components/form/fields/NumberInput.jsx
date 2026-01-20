import QuestionLabel from '../QuestionLabel'

function NumberInput({
  field,
  meta,
  fieldName,
  question,
  handleChange,
  baseInputClasses,
  inputStyle,
  readOnly = false,
}) {
  const placeholder = `Enter ${question.question_text.toLowerCase()}`

  return (
    <div className="space-y-2">
      <QuestionLabel htmlFor={fieldName} required={question.is_required}>
        {question.question_text}
      </QuestionLabel>
      <input
        type="number"
        id={fieldName}
        name={fieldName}
        value={field.value ?? ''}
        onChange={handleChange}
        onBlur={field.onBlur}
        className={`${baseInputClasses} placeholder-gray-400 ${readOnly ? 'bg-gray-100' : ''}`}
        style={inputStyle}
        placeholder={placeholder}
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

export default NumberInput
