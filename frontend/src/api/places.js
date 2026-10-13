import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: true,
})

let csrfToken = ''
let csrfRequest = null

async function loadCsrfToken() {
  if (!csrfRequest) {
    csrfRequest = api.get('/v1/auth/csrf', { skipCsrf: true })
      .then((response) => {
        csrfToken = response.data.token
        return csrfToken
      })
      .finally(() => {
        csrfRequest = null
      })
  }
  return csrfRequest
}

export async function refreshCsrfToken() {
  csrfToken = ''
  return loadCsrfToken()
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase()
  if (!config.skipCsrf && ['post', 'put', 'patch', 'delete'].includes(method)) {
    config.headers['X-CSRF-TOKEN'] = csrfToken || await loadCsrfToken()
  }
  return config
})

function toMapPlace(place) {
  const gallery = place.gallery || []

  return {
    ...place,
    coordinates: [Number(place.latitude), Number(place.longitude)],
    rating: Number(place.rating),
    gallery,
    hero: gallery[0]?.src || null,
  }
}

export async function getPlaces() {
  const response = await api.get('/v1/places')
  return response.data.map(toMapPlace)
}
