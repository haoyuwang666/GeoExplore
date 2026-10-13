import { api, refreshCsrfToken } from './places'

export function getApiMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error.response?.data?.detail || error.response?.data?.message || fallback
}

export async function getCurrentUser() {
  try {
    const response = await api.get('/v1/users/me')
    return response.data
  } catch (error) {
    if (error.response?.status === 401) return null
    throw error
  }
}

export async function registerUser(details) {
  const response = await api.post('/v1/auth/register', details)
  return response.data
}

export async function loginUser(details) {
  const response = await api.post('/v1/auth/login', details)
  return response.data
}

export async function logoutUser() {
  try {
    await api.post('/v1/auth/logout')
  } finally {
    await refreshCsrfToken()
  }
}

export async function setPlaceLiked(placeId, liked) {
  const response = liked
    ? await api.put(`/v1/users/me/likes/${placeId}`)
    : await api.delete(`/v1/users/me/likes/${placeId}`)
  return response.data
}

export async function getPlaceComments(placeId) {
  const response = await api.get(`/v1/places/${placeId}/comments`)
  return response.data
}

export async function addPlaceComment(placeId, body) {
  const response = await api.post(`/v1/places/${placeId}/comments`, { body })
  return response.data
}

export async function updateComment(commentId, body) {
  const response = await api.patch(`/v1/comments/${commentId}`, { body })
  return response.data
}

export async function deleteComment(commentId) {
  await api.delete(`/v1/comments/${commentId}`)
}

export async function getPlaceTips(placeId) {
  const response = await api.get(`/v1/places/${placeId}/tips`)
  return response.data
}

export async function addPlaceTip(placeId, category, body) {
  const response = await api.post(`/v1/places/${placeId}/tips`, { category, body })
  return response.data
}

export async function updateTip(tipId, category, body) {
  const response = await api.patch(`/v1/tips/${tipId}`, { category, body })
  return response.data
}

export async function deleteTip(tipId) {
  await api.delete(`/v1/tips/${tipId}`)
}
