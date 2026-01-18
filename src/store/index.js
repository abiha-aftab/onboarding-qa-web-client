import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import onboardingReducer from './slices/onboardingSlice'
import uiReducer from './slices/uiSlice'
import { setStoreRef } from './storeRef'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    ui: uiReducer,
  },
})

// Set store reference for use in non-React contexts
setStoreRef(store)
