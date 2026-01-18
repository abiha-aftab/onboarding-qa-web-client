import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getPendingOnboardings,
  fetchOnboardingStep,
  fetchAllOnboardingSteps,
  submitStepAnswer as submitStepAnswerService,
  getOnboardingStatus,
} from '../../services/onboardingService'

// Async thunks
export const fetchOnboardings = createAsyncThunk(
  'onboarding/fetchOnboardings',
  async (_, { rejectWithValue }) => {
    try {
      const status = await getOnboardingStatus()
      const pending = await getPendingOnboardings()
      return { status, pendingOnboardings: pending }
    } catch (error) {
      return rejectWithValue({
        message: error?.data?.message || error?.message || 'Failed to fetch onboardings',
        status: error?.status,
      })
    }
  }
)

export const selectOnboarding = createAsyncThunk(
  'onboarding/selectOnboarding',
  async (onboardingId, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const onboarding = state.onboarding.onboardings.find((o) => o.id === onboardingId)
      if (!onboarding) {
        throw new Error('Onboarding not found')
      }
      return onboarding
    } catch (error) {
      return rejectWithValue({
        message: error?.message || 'Failed to select onboarding',
      })
    }
  }
)

export const fetchOnboardingSteps = createAsyncThunk(
  'onboarding/fetchSteps',
  async ({ onboardingId, stepOrder, completedSteps = 0 }, { rejectWithValue }) => {
    try {
      // Fetch all steps at once with answers
      const steps = await fetchAllOnboardingSteps(onboardingId)
      
      // Determine the current step order to display
      // If stepOrder is provided, use it; otherwise use the first incomplete step
      let currentStepOrderToUse = stepOrder
      if (!currentStepOrderToUse) {
        // Find the first step that doesn't have all required questions answered
        // For now, just use completed_steps + 1 or 1 if no steps completed
        currentStepOrderToUse = completedSteps + 1
      }
      
      // Ensure currentStepOrder is within valid range
      if (currentStepOrderToUse < 1) currentStepOrderToUse = 1
      if (steps.length > 0 && currentStepOrderToUse > steps.length) {
        currentStepOrderToUse = steps.length
      }
      
      return { steps, currentStepOrder: currentStepOrderToUse }
    } catch (error) {
      return rejectWithValue({
        message: error?.data?.detail || error?.message || 'Failed to fetch steps',
        status: error?.status,
      })
    }
  }
)

export const submitStep = createAsyncThunk(
  'onboarding/submitStep',
  async ({ onboardingId, stepId, formValues, stepQuestions }, { rejectWithValue }) => {
    try {
      const response = await submitStepAnswerService(onboardingId, stepId, formValues, stepQuestions)
      
      // Refresh onboardings after submission
      const status = await getOnboardingStatus()
      const pending = await getPendingOnboardings()
      
      return {
        response,
        status,
        pendingOnboardings: pending,
      }
    } catch (error) {
      return rejectWithValue({
        message: error?.data?.detail || error?.message || 'Failed to submit step',
        status: error?.status,
      })
    }
  }
)

export const fetchNextStep = createAsyncThunk(
  'onboarding/fetchNextStep',
  async ({ onboardingId, nextStepOrder }, { rejectWithValue }) => {
    try {
      const step = await fetchOnboardingStep(onboardingId, nextStepOrder)
      return step
    } catch (error) {
      if (error?.status === 404) {
        // No more steps
        return null
      }
      return rejectWithValue({
        message: error?.data?.detail || error?.message || 'Failed to fetch next step',
        status: error?.status,
      })
    }
  }
)

const initialState = {
  onboardingStatus: null,
  onboardings: [],
  pendingOnboardings: [],
  selectedOnboarding: null,
  onboardingSteps: [],
  currentStepOrder: 1,
  formData: {},
  onboardingComplete: false,
  loading: false,
  loadingSteps: false,
  error: null,
}

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    updateFormData: (state, action) => {
      // Filter out File objects to prevent non-serializable values in Redux state
      // File objects will be handled separately during submission
      const serializableData = {}
      Object.keys(action.payload).forEach((key) => {
        const value = action.payload[key]
        // Only store serializable values (exclude File objects)
        if (!(value instanceof File)) {
          serializableData[key] = value
        }
      })
      state.formData = { ...state.formData, ...serializableData }
    },
    clearFormData: (state) => {
      state.formData = {}
    },
    setCurrentStepOrder: (state, action) => {
      state.currentStepOrder = action.payload
    },
    setOnboardingComplete: (state, action) => {
      state.onboardingComplete = action.payload
    },
    clearSelectedOnboarding: (state) => {
      state.selectedOnboarding = null
      state.onboardingSteps = []
      state.currentStepOrder = 1
      state.onboardingComplete = false
      state.formData = {}
    },
    addStep: (state, action) => {
      const step = action.payload
      const exists = state.onboardingSteps.some((s) => s.id === step.id || s.order === step.order)
      if (!exists) {
        state.onboardingSteps.push(step)
        state.onboardingSteps.sort((a, b) => (a.order || 0) - (b.order || 0))
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Onboardings
    builder
      .addCase(fetchOnboardings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOnboardings.fulfilled, (state, action) => {
        state.loading = false
        state.onboardingStatus = action.payload.status
        state.pendingOnboardings = action.payload.pendingOnboardings
        state.onboardings = action.payload.status.onboardings || []
        state.error = null
      })
      .addCase(fetchOnboardings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Select Onboarding
    builder
      .addCase(selectOnboarding.fulfilled, (state, action) => {
        state.selectedOnboarding = action.payload
        state.onboardingSteps = []
        state.currentStepOrder = 1
        state.onboardingComplete = false
      })
      .addCase(selectOnboarding.rejected, (state, action) => {
        state.error = action.payload
      })

    // Fetch Steps
    builder
      .addCase(fetchOnboardingSteps.pending, (state) => {
        state.loadingSteps = true
        state.error = null
      })
      .addCase(fetchOnboardingSteps.fulfilled, (state, action) => {
        state.loadingSteps = false
        // Normalize steps: ensure order field exists (map from step_number if needed)
        const normalizedSteps = action.payload.steps.map(step => ({
          ...step,
          order: step.order || step.step_number || 0
        }))
        state.onboardingSteps = normalizedSteps
        state.currentStepOrder = action.payload.currentStepOrder
        
        // Populate formData with existing answers from all steps
        const formData = {}
        normalizedSteps.forEach((step) => {
          if (step.step_questions) {
            step.step_questions.forEach((stepQuestion) => {
              const question = stepQuestion.question
              const userAnswer = stepQuestion.user_answer
              if (question && userAnswer) {
                const key = `question_${question.id}`
                // Populate based on answer type
                if (question.answer_type === 'text' || question.answer_type === 'file') {
                  formData[key] = userAnswer.answer_text || ''
                } else if (question.answer_type === 'number') {
                  formData[key] = userAnswer.answer_number || ''
                } else if (question.answer_type === 'date') {
                  formData[key] = userAnswer.answer_date || ''
                } else if (question.answer_type === 'boolean') {
                  formData[key] = userAnswer.answer_boolean ?? false
                }
              }
            })
          }
        })
        // Merge with existing formData (user input takes precedence)
        state.formData = { ...formData, ...state.formData }
        state.error = null
      })
      .addCase(fetchOnboardingSteps.rejected, (state, action) => {
        state.loadingSteps = false
        state.error = action.payload
        state.onboardingSteps = []
      })

    // Submit Step
    builder
      .addCase(submitStep.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitStep.fulfilled, (state, action) => {
        state.loading = false
        state.onboardingStatus = action.payload.status
        state.pendingOnboardings = action.payload.pendingOnboardings
        state.onboardings = action.payload.status.onboardings || []
        
        // Update selected onboarding if it exists and the ID matches
        // Only update if status or completed_steps changed to avoid unnecessary re-renders
        if (state.selectedOnboarding) {
          const updated = action.payload.status.onboardings?.find(
            (o) => o.id === state.selectedOnboarding.id
          )
          if (updated && (
            updated.status !== state.selectedOnboarding.status ||
            updated.completed_steps !== state.selectedOnboarding.completed_steps
          )) {
            state.selectedOnboarding = updated
            // Navigate to next step after submission
            // completed_steps is the last completed step, so next step is completed_steps + 1
            const nextStepOrder = (updated.completed_steps || 0) + 1
            const totalSteps = updated.total_steps || state.onboardingSteps.length
            if (nextStepOrder <= totalSteps) {
              state.currentStepOrder = nextStepOrder
            } else {
              // All steps completed
              state.onboardingComplete = true
            }
          }
        }
        state.error = null
      })
      .addCase(submitStep.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Fetch Next Step
    builder
      .addCase(fetchNextStep.fulfilled, (state, action) => {
        if (action.payload) {
          const step = action.payload
          const exists = state.onboardingSteps.some((s) => s.id === step.id || s.order === step.order)
          if (!exists) {
            state.onboardingSteps.push(step)
            state.onboardingSteps.sort((a, b) => (a.order || 0) - (b.order || 0))
          }
          // Always update currentStepOrder to navigate to the fetched step
          state.currentStepOrder = step.order
        } else {
          // No more steps
          state.onboardingComplete = true
        }
      })
      .addCase(fetchNextStep.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const {
  updateFormData,
  clearFormData,
  setCurrentStepOrder,
  setOnboardingComplete,
  clearSelectedOnboarding,
  addStep,
  clearError,
} = onboardingSlice.actions

export default onboardingSlice.reducer
