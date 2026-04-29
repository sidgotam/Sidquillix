import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth.js'
import { pushToast as toast } from '../utils/toastBus.js'

const TOKEN_KEY = 'sidquillix_token'

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [me, setMe] = useState(null)
  const [isBooting, setIsBooting] = useState(true)

  const isAuthed = Boolean(token)

  const saveToken = useCallback((next) => {
    setToken(next || '')
    if (next) localStorage.setItem(TOKEN_KEY, next)
    else localStorage.removeItem(TOKEN_KEY)
  }, [])

  const boot = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setIsBooting(false)
      return
    }

    try {
      const data = await authApi.getMe()
      setMe(data?.user || data)
    } catch {
      saveToken('')
      setMe(null)
    } finally {
      setIsBooting(false)
    }
  }, [saveToken])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    boot()
  }, [boot])

  const login = useCallback(
    async ({ email, password }) => {
      const data = await authApi.login({ email, password })
      const nextToken = data?.token || data?.accessToken
      if (!nextToken) throw new Error('Missing token in response')
      saveToken(nextToken)
      setMe(data?.user || null)
      toast({ title: 'Welcome back', message: 'You’re signed in.', tone: 'success' })
      return data
    },
    [saveToken],
  )

  const register = useCallback(
    async ({ name, username, email, password }) => {
      const data = await authApi.register({ name, username, email, password })
      const nextToken = data?.token || data?.accessToken
      if (nextToken) saveToken(nextToken)
      setMe(data?.user || null)
      toast({ title: 'Account created', message: 'Your space is ready.', tone: 'success' })
      return data
    },
    [saveToken],
  )

  const logout = useCallback(() => {
    saveToken('')
    setMe(null)
    toast({ title: 'Signed out', message: 'See you soon.', tone: 'default' })
  }, [saveToken])

  const updateProfile = useCallback(async ({ name, username, profilePicture }) => {
    const data = await authApi.updateMe({ name, username, profilePicture })
    setMe(data?.user || null)
    toast({ title: 'Profile updated', message: 'Changes saved successfully.', tone: 'success' })
    return data
  }, [])

  return useMemo(
    () => ({
      token,
      me,
      isAuthed,
      isBooting,
      login,
      register,
      updateProfile,
      logout,
    }),
    [token, me, isAuthed, isBooting, login, register, updateProfile, logout],
  )
}

