import axios from 'axios'

// Construct portal API URL
const getPortalApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
  // If API URL ends with /api, replace with /api/portal, otherwise append /portal
  if (apiUrl.endsWith('/api')) {
    return apiUrl.replace('/api', '/api/portal')
  }
  return `${apiUrl}/portal`
}

const portalApi = axios.create({
  baseURL: getPortalApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
portalApi.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('residentToken') || localStorage.getItem('portal_token')
    : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
portalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('residentToken')
      localStorage.removeItem('resident')
      localStorage.removeItem('portal_token')
      localStorage.removeItem('portal_resident')
      window.location.href = '/portal/login'
    }
    return Promise.reject(error)
  }
)

export default portalApi

