function CheckboxInput({ field, meta, fieldName, question, handleChange, readOnly = false }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={fieldName}
          name={fieldName}
          checked={field.value || false}
          onChange={handleChange}
          onBlur={field.onBlur}
          className={`w-5 h-5 text-[#0F5E7B] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#FFD350] focus:ring-offset-0 ${readOnly ? 'opacity-50' : ''}`}
          disabled={readOnly}
          aria-required={question.is_required}
          aria-invalid={meta.touched && meta.error ? 'true' : 'false'}
          aria-describedby={meta.touched && meta.error ? `${fieldName}-error` : undefined}
        />
        <label
          htmlFor={fieldName}
          className="text-sm sm:text-base font-medium"
          style={{ color: '#0F5E7B' }}
        >
          {question.question_text}
          {question.is_required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      </div>
      {meta.touched && meta.error && (
        <div
          id={`${fieldName}-error`}
          className="text-sm text-red-600 mt-1 ml-8"
          role="alert"
          aria-live="polite"
        >
          {meta.error}
        </div>
      )}
    </div>
  )
}

export default CheckboxInput
