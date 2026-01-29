import apiClient from './apiClient'

const ONBOARDING_STORAGE_KEY = 'onboarding_steps'
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed_at'

const DEFAULT_STEPS = [
  { id: 1, title: 'Profile Setup', status: 'pending' },
  { id: 2, title: 'Preferences', status: 'pending' },
  { id: 3, title: 'Verification', status: 'pending' },
]

export const fetchUserOnboardings = async () => {
  try {
    const response = await apiClient.get('/api/onboarding/user/')
    return response.data || []
  } catch (error) {
    console.error('Error fetching onboardings:', error)
    throw error
  }
}

export const getPendingOnboardings = async () => {
  try {
    const onboardings = await fetchUserOnboardings()
    return onboardings.filter(
      onboarding =>
        onboarding.status === 'pending' ||
        onboarding.status === 'inprogress' ||
        onboarding.status === 'in_progress' ||
        onboarding.status === 'pending_review' ||
        onboarding.status === 'inreview'
    )
  } catch (error) {
    console.error('Error getting pending onboardings:', error)
    return []
  }
}

export const getOnboardingSteps = () => {
  try {
    const steps = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (steps) {
      return JSON.parse(steps)
    }
    setOnboardingSteps(DEFAULT_STEPS)
    return DEFAULT_STEPS
  } catch (error) {
    console.error('Error getting onboarding steps:', error)
    return DEFAULT_STEPS
  }
}

export const setOnboardingSteps = steps => {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(steps))
  } catch (error) {
    console.error('Error saving onboarding steps:', error)
  }
}

export const updateStepStatus = (stepId, status) => {
  const steps = getOnboardingSteps()
  const updatedSteps = steps.map(step => (step.id === stepId ? { ...step, status } : step))
  setOnboardingSteps(updatedSteps)
  return updatedSteps
}

export const completeStep = stepId => {
  return updateStepStatus(stepId, 'completed')
}

export const fetchOnboardingStep = async (onboardingId, stepOrder) => {
  try {
    const response = await apiClient.get(`/api/onboarding/${onboardingId}/step/${stepOrder}/`)
    return response.data
  } catch (error) {
    console.error('Error fetching onboarding step:', error)
    throw error
  }
}

export const fetchAllOnboardingSteps = async onboardingId => {
  try {
    const response = await apiClient.get(`/api/onboarding/${onboardingId}/steps/`)
    return response.data || []
  } catch (error) {
    console.error('Error fetching all onboarding steps:', error)
    throw error
  }
}

const uploadDocument = async (onboardingId, questionId, file) => {
  const formData = new FormData()
  formData.append('onboarding_id', onboardingId)
  formData.append('question_id', questionId)
  formData.append('file', file)

  const response = await apiClient.post('/api/answer/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

// Submit answers for a specific step
export const submitStepAnswer = async (onboardingId, stepId, formValues, stepQuestions) => {
  try {
    const responses = []
    const uploadedFiles = {}

    if (!stepQuestions || stepQuestions.length === 0) {
      const requestData = {
        onboarding_id: onboardingId,
        step_id: stepId,
        responses: [],
      }
      const response = await apiClient.post('/api/onboarding/user/answer/', requestData)
      return response.data
    }

    // Upload files first (file questions require separate endpoint)
    for (const stepQuestion of stepQuestions) {
      const question = stepQuestion.question
      if (question.answer_type !== 'file') continue

      const key = `question_${question.id}`
      const value = formValues[key]

      if (value instanceof File) {
        const uploadResult = await uploadDocument(onboardingId, question.id, value)
        uploadedFiles[key] = {
          file_name: uploadResult.file_name,
          file_url: uploadResult.file_url,
          document_id: uploadResult.document_id,
        }
      } else if (value && typeof value === 'object') {
        // Already uploaded or placeholder data
        if (value.file_url || value.url) {
          uploadedFiles[key] = {
            file_name: value.file_name || value.name,
            file_url: value.file_url || value.url,
            document_id: value.document_id,
          }
        }
      } else if (typeof value === 'string' && value.trim() !== '') {
        uploadedFiles[key] = {
          file_name: value.split('/').pop(),
          file_url: value,
        }
      }
    }

    // Process each question in the step
    // Skip file questions - they need to be uploaded via separate document endpoint
    stepQuestions.forEach(stepQuestion => {
      const question = stepQuestion.question

      if (question.answer_type === 'file') {
        console.warn(
          `Skipping file question ${question.id} - file uploads require separate document endpoint`
        )
        return
      }

      const key = `question_${question.id}`
      let answerValue = formValues[key]

      if (answerValue === undefined) {
        switch (question.answer_type) {
          case 'boolean':
            answerValue = false
            break
          case 'number':
            answerValue = ''
            break
          default:
            answerValue = ''
        }
      }

      const answer = {}

      switch (question.answer_type) {
        case 'text':
          answer.answer_text =
            answerValue === null || answerValue === undefined ? '' : String(answerValue)
          break
        case 'number':
          if (answerValue === '' || answerValue === null || answerValue === undefined) {
            answer.answer_number = null
          } else {
            const numValue = Number(answerValue)
            answer.answer_number = isNaN(numValue) ? null : numValue
          }
          break
        case 'date':
          if (answerValue === '' || answerValue === null || answerValue === undefined) {
            answer.answer_date = null
          } else {
            let dateStr = answerValue
            if (answerValue instanceof Date) {
              dateStr = answerValue.toISOString().split('T')[0]
            } else if (typeof answerValue === 'string') {
              const date = new Date(answerValue)
              if (!isNaN(date.getTime())) {
                dateStr = date.toISOString().split('T')[0]
              }
            }
            answer.answer_date = dateStr
          }
          break
        case 'boolean':
          if (answerValue === null || answerValue === undefined) {
            answer.answer_boolean = false
          } else {
            answer.answer_boolean = Boolean(answerValue)
          }
          break
        default:
          answer.answer_text =
            answerValue === null || answerValue === undefined ? '' : String(answerValue)
      }

      responses.push({ question_id: question.id, answer })
    })

    const requestData = {
      onboarding_id: onboardingId,
      step_id: stepId,
      responses: responses,
    }

    const response = await apiClient.post('/api/onboarding/user/answer/', requestData)
    return { data: response.data, uploadedFiles }
  } catch (error) {
    console.error('Error submitting step answer:', error)
    throw error
  }
}

export const getOnboardingStatus = async () => {
  try {
    const onboardings = await fetchUserOnboardings()

    const pendingOnboardings = onboardings.filter(
      onboarding =>
        onboarding.status === 'pending' ||
        onboarding.status === 'inprogress' ||
        onboarding.status === 'in_progress' ||
        onboarding.status === 'pending_review' ||
        onboarding.status === 'inreview'
    )

    return {
      status: pendingOnboardings.length > 0 ? 'pending' : 'completed',
      completedCount: onboardings.filter(o => o.status === 'completed').length,
      totalCount: onboardings.length,
      pendingCount: pendingOnboardings.length,
      pendingOnboardings: pendingOnboardings,
      onboardings: onboardings,
    }
  } catch (error) {
    console.error('Error getting onboarding status:', error)
    return {
      status: 'pending',
      completedCount: 0,
      totalCount: 0,
      pendingCount: 0,
      pendingOnboardings: [],
      onboardings: [],
    }
  }
}

export const getOnboardingStatusById = async onboardingId => {
  try {
    const response = await apiClient.get(`/api/onboarding/${onboardingId}/status/`)
    return response.data
  } catch (error) {
    console.error('Error fetching onboarding status:', error)
    throw error
  }
}

export const markOnboardingCompleted = () => {
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, Date.now().toString())
}

export const resetOnboarding = () => {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY)
  localStorage.removeItem(ONBOARDING_COMPLETED_KEY)
  return getOnboardingSteps()
}

export const initializeOnboarding = userId => {
  const userKey = `${ONBOARDING_STORAGE_KEY}_${userId}`
  const userCompletedKey = `${ONBOARDING_COMPLETED_KEY}_${userId}`

  const existingSteps = localStorage.getItem(userKey)
  if (existingSteps) {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, existingSteps)
    const completedAt = localStorage.getItem(userCompletedKey)
    if (completedAt) {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, completedAt)
    }
  } else {
    setOnboardingSteps(DEFAULT_STEPS)
  }
}
