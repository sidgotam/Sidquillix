import { http } from './http.js'

export async function login(payload) {
  const { data } = await http.post('/auth/login', payload)
  return data
}

export async function register(payload) {
  const { data } = await http.post('/auth/register', payload)
  return data
}

export async function getMe() {
  const { data } = await http.get('/auth/me')
  return data
}

export async function updateMe({ name, username, profilePicture }) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('username', username)
  if (profilePicture) formData.append('profilePicture', profilePicture)

  const { data } = await http.patch('/auth/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

