// src/services/authService.js
import apiClient from './apiClient'

/**
 * LocalStorage helpers
 */
const getToken = () => localStorage.getItem('authToken')

const setToken = token => {
  if (token) {
    localStorage.setItem('authToken', token)
  } else {
    localStorage.removeItem('authToken')
  }
}

const getUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

const setUser = user => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user))
  } else {
    localStorage.removeItem('user')
  }
}

const clearAuth = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

/**
 * Centralized API request wrapper
 */
const apiRequest = async (endpoint, options = {}) => {
  const method = options.method || 'GET'
  let data = options.data

  // Support legacy 'body' key if provided
  if (options.body && !data) {
    data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body
  }

  const { body: _body, method: _method, ...restOptions } = options

  const response = await apiClient.request({
    url: endpoint,
    method,
    data,
    ...restOptions,
  })

  return response.data
}

/**
 * Login user
 */
export const login = async (email, password) => {
  try {
    const data = await apiRequest('/api/user/login/', {
      method: 'POST',
      data: { email, password },
    })

    if (data.access) setToken(data.access)
    if (data.refresh) localStorage.setItem('refreshToken', data.refresh)

    const userData = {
      id: data.user_id || data.id,
      email: data.email || email,
      role: data.role || null,
    }
    setUser(userData)

    return { ...data, user: userData }
  } catch (error) {
    clearAuth()
    throw error
  }
}

/**
 * Logout user
 */
export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')

    if (refreshToken) {
      await apiRequest('/api/user/logout/', {
        method: 'POST',
        data: { refresh: refreshToken },
      })
    }
  } catch (error) {
    console.error('Logout API error:', error)
  } finally {
    clearAuth()
  }
}

/**
 * Get current user info from API
 */
export const getMe = async () => {
  try {
    const data = await apiRequest('/api/user/me/', { method: 'GET' })

    if (data.id || data.email) {
      setUser(data)
    }

    return data
  } catch (error) {
    if (error.status === 401) clearAuth()
    throw error
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => !!getToken()

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => getUser()
