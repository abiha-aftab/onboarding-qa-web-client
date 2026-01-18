import axios from 'axios'
import { getStoreRef } from '../store/storeRef'
import { showToast } from '../store/slices/uiSlice'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Create axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log request for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        headers: config.headers,
      })
    }

    return config
  },
  error => {
    // Log request error
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

/**
 * Response interceptor: Handle responses and errors globally
 * Provides consistent error handling and logging
 */
apiClient.interceptors.response.use(
  response => {
    // Log successful response for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        }
      )
    }

    return response
  },
  error => {
    const store = getStoreRef()
    let errorMessage = 'An error occurred'
    let errorStatus = 0

    // Handle axios errors
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      const { status, data } = error.response
      errorStatus = status

      // Log error response for debugging
      console.error(
        `[API Error Response] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        {
          status,
          data,
        }
      )

      // Show toast notification based on error status
      if (store) {
        if (status === 404) {
          errorMessage = data?.detail || data?.message || 'Resource not found'
          store.dispatch(showToast({ type: 'error', message: errorMessage }))
        } else if (status === 500) {
          errorMessage = data?.detail || data?.message || 'Internal server error. Please try again later.'
          store.dispatch(showToast({ type: 'error', message: errorMessage }))
        } else if (status === 401) {
          // Don't show toast for 401 as auth slice handles it
          errorMessage = data?.detail || data?.message || 'Unauthorized'
        } else if (status >= 400 && status < 500) {
          errorMessage = data?.detail || data?.message || data?.error || `Client error: ${status}`
          store.dispatch(showToast({ type: 'error', message: errorMessage }))
        } else if (status >= 500) {
          errorMessage = data?.detail || data?.message || 'Server error. Please try again later.'
          store.dispatch(showToast({ type: 'error', message: errorMessage }))
        }
      }

      // Create error object with status and data for consistent error handling
      const apiError = new Error(errorMessage)
      apiError.status = status
      apiError.data = data
      apiError.response = error.response

      return Promise.reject(apiError)
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error('[API Network Error]', {
        url: error.config?.url,
        message: 'No response received from server',
      })

      errorMessage = 'Network error: Unable to reach server. Please check your connection.'
      
      if (store) {
        store.dispatch(showToast({ type: 'error', message: errorMessage }))
      }

      const networkError = new Error(errorMessage)
      networkError.status = 0
      networkError.data = { message: 'Network error' }

      return Promise.reject(networkError)
    } else {
      // Error setting up the request
      console.error('[API Request Setup Error]', error.message)

      errorMessage = error.message || 'Request setup error'
      
      if (store) {
        store.dispatch(showToast({ type: 'error', message: errorMessage }))
      }

      const setupError = new Error(errorMessage)
      setupError.status = 0
      setupError.data = { message: error.message }

      return Promise.reject(setupError)
    }
  }
)

export default apiClient
