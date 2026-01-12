import { useField } from 'formik';

function DynamicField({ question }) {
  const fieldName = `question_${question.id}`;
  const [field, meta, helpers] = useField(fieldName);

  const handleChange = (e) => {
    const { value, checked, files } = e.target;

    switch (question.answer_type) {
      case 'number':
        helpers.setValue(value === '' ? '' : Number(value));
        break;
      case 'boolean':
        helpers.setValue(checked);
        break;
      case 'file':
        helpers.setValue(files?.[0] || null);
        break;
      default:
        helpers.setValue(value);
    }
  };

  const renderInput = () => {
    const baseInputClasses = `w-full px-4 py-3 text-base bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFD350] focus:border-[#0F5E7B] transition-all duration-200 ${
      meta.touched && meta.error ? 'border-red-500' : 'border-gray-200'
    } hover:border-gray-300`;

    const inputStyle = { color: '#0F5E7B', fontSize: '1rem' };
    const placeholder = `Enter ${question.question_text.toLowerCase()}`;

    switch (question.answer_type) {
      case 'text':
        return (
          <input
            {...field}
            type="text"
            id={fieldName}
            name={fieldName}
            onChange={handleChange}
            onBlur={field.onBlur}
            className={`${baseInputClasses} placeholder-gray-400`}
            style={inputStyle}
            placeholder={placeholder}
            aria-required={question.is_required}
            aria-invalid={meta.touched && meta.error ? 'true' : 'false'}
            aria-describedby={meta.touched && meta.error ? `${fieldName}-error` : undefined}
          />
        );

      case 'number':
        return (
          <input
            {...field}
            type="number"
            id={fieldName}
            name={fieldName}
            onChange={handleChange}
            onBlur={field.onBlur}
            className={`${baseInputClasses} placeholder-gray-400`}
            style={inputStyle}
            placeholder={placeholder}
            aria-required={question.is_required}
            aria-invalid={meta.touched && meta.error ? 'true' : 'false'}
            aria-describedby={meta.touched && meta.error ? `${fieldName}-error` : undefined}
          />
        );

      case 'date':
        return (
          <input
            {...field}
            type="date"
            id={fieldName}
            name={fieldName}
            onChange={handleChange}
            onBlur={field.onBlur}
            className={baseInputClasses}
            style={inputStyle}
            aria-required={question.is_required}
            aria-invalid={meta.touched && meta.error ? 'true' : 'false'}
            aria-describedby={meta.touched && meta.error ? `${fieldName}-error` : undefined}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={fieldName}
              name={fieldName}
              checked={field.value || false}
              onChange={handleChange}
              onBlur={field.onBlur}
              className="w-5 h-5 text-[#0F5E7B] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#FFD350] focus:ring-offset-0"
              aria-required={question.is_required}
              aria-invalid={meta.touched && meta.error ? 'true' : 'false'}
              aria-describedby={meta.touched && meta.error ? `${fieldName}-error` : undefined}
            />
            <label
              htmlFor={fieldName}
              className="text-base font-medium"
              style={{ color: '#0F5E7B' }}
            >
              {question.question_text}
            </label>
          </div>
        );

      case 'file':
        return (
          <div>
            <input
              type="file"
              id={fieldName}
              name={fieldName}
              onChange={handleChange}
              onBlur={field.onBlur}
              className={baseInputClasses}
              style={inputStyle}
              aria-required={question.is_required}
              aria-invalid={meta.touched && meta.error ? 'true' : 'false'}
              aria-describedby={meta.touched && meta.error ? `${fieldName}-error` : undefined}
            />
            {field.value && (
              <p className="mt-2 text-sm" style={{ color: '#576472' }}>
                Selected: {field.value.name || 'File selected'}
              </p>
            )}
          </div>
        );

      default:
        return (
          <input
            {...field}
            type="text"
            id={fieldName}
            name={fieldName}
            onChange={handleChange}
            onBlur={field.onBlur}
            className={`${baseInputClasses} placeholder-gray-400`}
            style={inputStyle}
            placeholder={placeholder}
            aria-required={question.is_required}
            aria-invalid={meta.touched && meta.error ? 'true' : 'false'}
            aria-describedby={meta.touched && meta.error ? `${fieldName}-error` : undefined}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {question.answer_type !== 'boolean' && (
        <label
          htmlFor={fieldName}
          className="block text-base font-semibold tracking-tight"
          style={{ color: '#0F5E7B', fontSize: '1rem' }}
        >
          {question.question_text}
          {question.is_required && (
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}
      {renderInput()}
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
  );
}

export default DynamicField;
