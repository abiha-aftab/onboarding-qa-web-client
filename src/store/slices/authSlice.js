import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { login as loginService, logout as logoutService, getMe, isAuthenticated, getCurrentUser } from '../../services/authService'

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await loginService(email, password)
      return response
    } catch (error) {
      return rejectWithValue({
        message: error?.data?.message || error?.message || 'Failed to login',
        status: error?.status,
        data: error?.data,
      })
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await logoutService()
      return null
    } catch {
      // Even if logout fails, clear local state
      return null
    }
  }
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      if (isAuthenticated()) {
        const userData = await getMe()
        const currentUser = getCurrentUser()
        return currentUser || { email: userData.email || userData.user?.email }
      }
      return null
    } catch (error) {
      return rejectWithValue({
        message: error?.data?.message || error?.message || 'Auth check failed',
        status: error?.status,
      })
    }
  }
)

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  checkingAuth: true,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    clearAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        const currentUser = getCurrentUser()
        state.user = currentUser || { email: action.payload.email || action.payload.user?.email }
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload
      })

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.checkingAuth = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.checkingAuth = false
        if (action.payload) {
          state.user = action.payload
          state.isAuthenticated = true
        } else {
          state.user = null
          state.isAuthenticated = false
        }
        state.error = null
      })
      .addCase(checkAuth.rejected, (state) => {
        state.checkingAuth = false
        state.user = null
        state.isAuthenticated = false
      })
  },
})

export const { setUser, clearAuth, clearError } = authSlice.actions

export default authSlice.reducer
