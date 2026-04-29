import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'https://sidquillix-backend.onrender.com'

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('sidquillix_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Request failed'

    error.sidquillixMessage = message
    return Promise.reject(error)
  },
)

