import { http } from './http.js'

export async function toggleLike(expressionId) {
  const { data } = await http.put(`/expressions/${expressionId}/like`)
  return {
    ...data,
    liked: Boolean(data?.liked),
    likes: typeof data?.likes === 'number' ? data.likes : 0,
  }
}

