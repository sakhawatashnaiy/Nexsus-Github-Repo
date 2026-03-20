import { configureStore, isRejectedWithValue, type Middleware } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from '@/services/api/baseApi'
import { authReducer } from '@/features/auth/authSlice'

const apiErrorLogger: Middleware = () => (next) => (action) => {
  if (import.meta.env.DEV && isRejectedWithValue(action)) {
    // eslint-disable-next-line no-console
    console.error('API error:', action)
  }
  return next(action)
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setCredentials'],
      },
    }).concat(apiErrorLogger, baseApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
