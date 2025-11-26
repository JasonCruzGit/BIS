/**
 * Get the full URL for an uploaded file
 * @param filePath - The relative file path from the backend (e.g., /uploads/officials/photo.jpg)
 * @returns The full URL to access the file
 */
export function getFileUrl(filePath: string | null | undefined): string {
  if (!filePath) {
    return ''
  }

  // If it's already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }

  // Get the backend URL (without /api)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
  const backendUrl = apiUrl.replace('/api', '')

  // Ensure the path starts with /
  const path = filePath.startsWith('/') ? filePath : `/${filePath}`

  return `${backendUrl}${path}`
}

