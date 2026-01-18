import DynamicField from '../DynamicField'

function QuestionList({ questions, stepId, readOnly = false }) {
  if (!questions || questions.length === 0) {
    return null
  }

  return (
    <div className="space-y-6 mb-6">
      {questions.map((stepQuestion, index) => {
        const question = stepQuestion?.question
        // Skip if question is completely missing
        if (!question) {
          console.warn(`QuestionList: Skipping question at index ${index} - missing question object`, stepQuestion)
          return null
        }
        
        // Use stepQuestion.id as fallback if question.id is missing (shouldn't happen after backend fix, but be defensive)
        const questionId = question.id ?? stepQuestion.id
        if (!questionId) {
          console.warn(`QuestionList: Skipping question at index ${index} - missing both question.id and stepQuestion.id`, stepQuestion)
          return null
        }
        
        // Ensure question has an id for DynamicField (create a temporary one if needed)
        const questionWithId = { ...question, id: questionId }
        
        // Use questionId for unique key - this ensures each field is uniquely identified
        const safeStepId = stepId ?? 'step'
        return (
          <DynamicField key={`${safeStepId}_${questionId}`} question={questionWithId} readOnly={readOnly} />
        )
      })}
    </div>
  )
}

export default QuestionList
