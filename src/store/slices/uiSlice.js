import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  alerts: [],
  toasts: [],
  globalLoading: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showAlert: (state, action) => {
      const { id, type, message, dismissible = true } = action.payload
      state.alerts.push({
        id: id || `alert-${Date.now()}-${Math.random()}`,
        type: type || 'info',
        message,
        dismissible,
      })
    },
    hideAlert: (state, action) => {
      const alertId = action.payload
      state.alerts = state.alerts.filter(alert => alert.id !== alertId)
    },
    clearAlerts: state => {
      state.alerts = []
    },
    showToast: (state, action) => {
      const { id, type, message, duration = 5000 } = action.payload
      state.toasts.push({
        id: id || `toast-${Date.now()}-${Math.random()}`,
        type: type || 'info',
        message,
        duration,
        timestamp: Date.now(),
      })
    },
    hideToast: (state, action) => {
      const toastId = action.payload
      state.toasts = state.toasts.filter(toast => toast.id !== toastId)
    },
    clearToasts: state => {
      state.toasts = []
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload
    },
  },
})

export const {
  showAlert,
  hideAlert,
  clearAlerts,
  showToast,
  hideToast,
  clearToasts,
  setGlobalLoading,
} = uiSlice.actions

export default uiSlice.reducer
