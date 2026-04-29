import { http } from './http.js'

function normalizeExpression(item) {
  const mediaItems = Array.isArray(item?.media) ? item.media : []
  const images = mediaItems.filter((m) => m?.type === 'image').map((m) => m.url).filter(Boolean)
  const video = mediaItems.find((m) => m?.type === 'video')?.url || null

  return {
    ...item,
    id: item?.id || item?._id,
    author: {
      name: item?.author?.name || item?.userId?.name || item?.userId?.username || 'Anonymous',
      handle: item?.author?.handle || item?.userId?.username || '',
    },
    media: {
      images,
      video,
    },
    likeCount: typeof item?.likeCount === 'number' ? item.likeCount : item?.likes || 0,
    likedByMe: Boolean(item?.likedByMe),
  }
}

function normalizeExpressionListResponse(data) {
  const list = data?.items || data?.expressions || data || []
  const expressions = Array.isArray(list) ? list.map(normalizeExpression) : []
  return {
    ...data,
    expressions,
    items: expressions,
  }
}

export async function listExpressions(params) {
  const { data } = await http.get('/expressions', { params })
  return normalizeExpressionListResponse(data)
}

export async function createExpression(formData) {
  const { data } = await http.post('/expressions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data?.expression ? { ...data, expression: normalizeExpression(data.expression) } : data
}

export async function listMyExpressions(params) {
  const { data } = await http.get('/expressions/me', { params })
  return normalizeExpressionListResponse(data)
}

export async function updateExpression(expressionId, payload) {
  const { data } = await http.put(`/expressions/${expressionId}`, payload)
  return data?.expression ? normalizeExpression(data.expression) : null
}

export async function deleteExpression(expressionId) {
  const { data } = await http.delete(`/expressions/${expressionId}`)
  return data
}

