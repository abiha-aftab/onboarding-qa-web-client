import QuestionLabel from '../QuestionLabel'

function FileInput({ field, meta, fieldName, question, handleChange, baseInputClasses, inputStyle, readOnly = false }) {
  return (
    <div className="space-y-2">
      <QuestionLabel htmlFor={fieldName} required={question.is_required}>
        {question.question_text}
      </QuestionLabel>
      <input
        type="file"
        id={fieldName}
        name={fieldName}
        onChange={handleChange}
        onBlur={field.onBlur}
        className={`${baseInputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FFD350] file:text-[#0F5E7B] hover:file:bg-[#FFE066] ${readOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        style={inputStyle}
        accept="image/*"
        disabled={readOnly}
        aria-required={question.is_required}
        aria-invalid={meta.touched && meta.error ? 'true' : 'false'}
        aria-describedby={meta.touched && meta.error ? `${fieldName}-error` : undefined}
      />
      {field.value && (
        <p className="mt-2 text-xs sm:text-sm truncate" style={{ color: '#576472' }}>
          Selected: {field.value.name || 'File selected'}
        </p>
      )}
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

export default FileInput
