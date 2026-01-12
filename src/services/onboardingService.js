import apiClient from './apiClient'
import { getCurrentUser } from './authService'

// Onboarding service for frontend-only tracking
const ONBOARDING_STORAGE_KEY = 'onboarding_steps'
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed_at'

// Default onboarding steps (you can customize these)
const DEFAULT_STEPS = [
  { id: 1, title: 'Profile Setup', status: 'pending' },
  { id: 2, title: 'Preferences', status: 'pending' },
  { id: 3, title: 'Verification', status: 'pending' },
]

// Fetch onboardings from backend API
// Uses JWT authentication - no query params needed
export const fetchUserOnboardings = async () => {
  try {
    const response = await apiClient.get('/api/onboarding/user/')
    return response.data || []
  } catch (error) {
    console.error('Error fetching onboardings:', error)
    throw error
  }
}

// Get pending onboardings
export const getPendingOnboardings = async () => {
  try {
    const onboardings = await fetchUserOnboardings()
    return onboardings.filter(
      onboarding => onboarding.status === 'pending' || onboarding.status === 'inprogress'
    )
  } catch (error) {
    console.error('Error getting pending onboardings:', error)
    return []
  }
}

// Get onboarding steps from localStorage
export const getOnboardingSteps = () => {
  try {
    const steps = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (steps) {
      return JSON.parse(steps)
    }
    // Initialize with default steps for new users
    setOnboardingSteps(DEFAULT_STEPS)
    return DEFAULT_STEPS
  } catch (error) {
    console.error('Error getting onboarding steps:', error)
    return DEFAULT_STEPS
  }
}

// Save onboarding steps to localStorage
export const setOnboardingSteps = steps => {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(steps))
  } catch (error) {
    console.error('Error saving onboarding steps:', error)
  }
}

// Update a specific step status
export const updateStepStatus = (stepId, status) => {
  const steps = getOnboardingSteps()
  const updatedSteps = steps.map(step => (step.id === stepId ? { ...step, status } : step))
  setOnboardingSteps(updatedSteps)
  return updatedSteps
}

// Mark a step as completed
export const completeStep = stepId => {
  return updateStepStatus(stepId, 'completed')
}

// Get onboarding step details from backend API
export const fetchOnboardingStep = async (onboardingId, stepOrder) => {
  try {
    const response = await apiClient.get(`/api/onboarding/${onboardingId}/step/${stepOrder}/`)
    return response.data
  } catch (error) {
    console.error('Error fetching onboarding step:', error)
    throw error
  }
}

// Get onboarding status from backend API
export const getOnboardingStatus = async () => {
  try {
    const onboardings = await fetchUserOnboardings()

    // Backend returns onboardings with: id, onboarding_title, status, created_at
    // Steps need to be fetched separately using fetchOnboardingStep
    const pendingOnboardings = onboardings.filter(
      onboarding => onboarding.status === 'pending' || onboarding.status === 'inprogress'
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
    // Return default structure on error
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

// Mark onboarding as completed
export const markOnboardingCompleted = () => {
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, Date.now().toString())
}

// Reset onboarding (useful for testing or re-onboarding)
export const resetOnboarding = () => {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY)
  localStorage.removeItem(ONBOARDING_COMPLETED_KEY)
  return getOnboardingSteps()
}

// Initialize onboarding for a user (call this when user logs in)
export const initializeOnboarding = userId => {
  const userKey = `${ONBOARDING_STORAGE_KEY}_${userId}`
  const userCompletedKey = `${ONBOARDING_COMPLETED_KEY}_${userId}`

  // Check if user has existing onboarding data
  const existingSteps = localStorage.getItem(userKey)
  if (existingSteps) {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, existingSteps)
    const completedAt = localStorage.getItem(userCompletedKey)
    if (completedAt) {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, completedAt)
    }
  } else {
    // Initialize fresh onboarding for new user
    setOnboardingSteps(DEFAULT_STEPS)
  }
}
