import { useField } from 'formik'
import TextInput from './form/fields/TextInput'
import NumberInput from './form/fields/NumberInput'
import DateInput from './form/fields/DateInput'
import CheckboxInput from './form/fields/CheckboxInput'
import FileInput from './form/fields/FileInput'

function DynamicField({ question, readOnly = false }) {
  // Ensure fieldName is always unique - use question.id if available, otherwise throw error
  // This prevents field name collisions
  // Call hook before any early returns to satisfy Rules of Hooks
  // Use a static fallback for invalid questions to avoid impure Math.random()
  const fieldName = question?.id ? `question_${question.id}` : 'question_invalid'
  const [field, meta, helpers] = useField(fieldName)

  if (!question || !question.id) {
    console.error('DynamicField: question or question.id is missing', question)
    return null
  }

  const handleChange = e => {
    const { value, checked, files } = e.target

    switch (question.answer_type) {
      case 'number':
        helpers.setValue(value === '' ? '' : Number(value))
        break
      case 'boolean':
        helpers.setValue(checked)
        break
      case 'file':
        helpers.setValue(files?.[0] || null)
        break
      case 'date':
        // Date input returns YYYY-MM-DD format, store as-is
        helpers.setValue(value || '')
        break
      default:
        helpers.setValue(value)
    }
  }

  const baseInputClasses = `w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFD350] focus:border-[#0F5E7B] transition-all duration-200 ${
    meta.touched && meta.error ? 'border-red-500' : 'border-gray-200'
  } hover:border-gray-300`

  const inputStyle = { color: '#0F5E7B', fontSize: '0.875rem' } // sm:text-base will override on larger screens

  switch (question.answer_type) {
    case 'text':
      return (
        <TextInput
          field={field}
          meta={meta}
          fieldName={fieldName}
          question={question}
          handleChange={handleChange}
          baseInputClasses={baseInputClasses}
          inputStyle={inputStyle}
          readOnly={readOnly}
        />
      )
    case 'number':
      return (
        <NumberInput
          field={field}
          meta={meta}
          fieldName={fieldName}
          question={question}
          handleChange={handleChange}
          baseInputClasses={baseInputClasses}
          inputStyle={inputStyle}
          readOnly={readOnly}
        />
      )
    case 'date':
      return (
        <DateInput
          field={field}
          meta={meta}
          fieldName={fieldName}
          question={question}
          handleChange={handleChange}
          baseInputClasses={baseInputClasses}
          inputStyle={inputStyle}
          readOnly={readOnly}
        />
      )
    case 'boolean':
      return (
        <CheckboxInput
          field={field}
          meta={meta}
          fieldName={fieldName}
          question={question}
          handleChange={handleChange}
          readOnly={readOnly}
        />
      )
    case 'file':
      return (
        <FileInput
          field={field}
          meta={meta}
          fieldName={fieldName}
          question={question}
          handleChange={handleChange}
          baseInputClasses={baseInputClasses}
          inputStyle={inputStyle}
          readOnly={readOnly}
        />
      )
    default:
      return (
        <TextInput
          field={field}
          meta={meta}
          fieldName={fieldName}
          question={question}
          handleChange={handleChange}
          baseInputClasses={baseInputClasses}
          inputStyle={inputStyle}
          readOnly={readOnly}
        />
      )
  }
}

export default DynamicField
