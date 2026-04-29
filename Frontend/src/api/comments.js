import { http } from './http.js'

function normalizeComment(item) {
  return {
    ...item,
    id: item?.id || item?._id,
    text: item?.text || '',
    createdAt: item?.createdAt,
    author: {
      name: item?.author?.name || item?.userId?.name || item?.userId?.username || 'Anonymous',
      handle: item?.author?.handle || item?.userId?.username || '',
    },
  }
}

export async function listComments(expressionId, params = {}) {
  const { data } = await http.get(`/comments/${expressionId}`, { params })
  const list = data?.comments || []
  return {
    ...data,
    comments: Array.isArray(list) ? list.map(normalizeComment) : [],
  }
}

export async function createComment(payload) {
  const { data } = await http.post('/comments', payload)
  return data?.comment ? normalizeComment(data.comment) : null
}

