'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Home,
  FileText,
  Loader2,
  Shield,
  CheckCircle
} from 'lucide-react'
import { format } from 'date-fns'

export default function PublicResidentPage() {
  const params = useParams()
  const residentId = params.id as string
  const [resident, setResident] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResident = async () => {
      try {
        setLoading(true)
        // Use the QR code endpoint to get resident by QR code (public, no auth required)
        // Determine API URL based on current hostname
        let apiUrl = process.env.NEXT_PUBLIC_API_URL
        
        if (!apiUrl && typeof window !== 'undefined') {
          // If on production domain, use production backend
          if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('frontend-blush-chi-30')) {
            // Use your production backend URL here
            apiUrl = 'https://your-backend-render-url.onrender.com/api'
          } else {
            apiUrl = 'http://localhost:5001/api'
          }
        }
        
        if (!apiUrl) {
          apiUrl = 'http://localhost:5001/api'
        }
        
        const response = await fetch(`${apiUrl}/residents/qr/${residentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Resident not found')
        }
        
        const data = await response.json()
        setResident(data)
        setError(null)
      } catch (err: any) {
        console.error('Error fetching resident:', err)
        setError(err.message || 'Resident not found')
      } finally {
        setLoading(false)
      }
    }

    if (residentId) {
      fetchResident()
    }
  }, [residentId])

  // Helper function to get file URL
  const getFileUrl = (filePath: string | null | undefined): string => {
    if (!filePath) return ''
    if (filePath.startsWith('http')) return filePath
    
    // Determine API base URL
    let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''
    
    if (!apiBaseUrl && typeof window !== 'undefined') {
      if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('frontend-blush-chi-30')) {
        // Production - you need to set your Render backend URL here
        apiBaseUrl = 'https://your-backend-render-url.onrender.com'
      } else {
        apiBaseUrl = 'http://localhost:5001'
      }
    }
    
    return `${apiBaseUrl}${filePath}`
  }

  // Set page title when resident is loaded
  useEffect(() => {
    if (resident) {
      document.title = `${resident.firstName} ${resident.lastName} - Resident Information | BIS`
    }
  }, [resident])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-sm w-full">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading resident information...</p>
          <p className="text-xs text-gray-400 mt-2">Please wait</p>
        </div>
      </div>
    )
  }

  if (error || !resident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Resident Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The resident information could not be found.'}</p>
          <p className="text-xs text-gray-400">Please verify the QR code is valid and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Verified Badge */}
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Verified Resident Information</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex-shrink-0">
              {resident.idPhoto ? (
                <img
                  src={getFileUrl(resident.idPhoto)}
                  alt={`${resident.firstName} ${resident.lastName}`}
                  className="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover border-4 border-primary-200 shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                    ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center border-4 border-primary-200 shadow-lg ${resident.idPhoto ? 'hidden' : ''}`}>
                <User className="h-16 w-16 sm:h-20 sm:w-20 text-white" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {resident.firstName} {resident.middleName} {resident.lastName} {resident.suffix}
              </h1>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <span className="px-3 py-1.5 text-sm font-medium bg-primary-100 text-primary-800 rounded-full flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {resident.residencyStatus}
                </span>
                <span className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
                  {resident.civilStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-primary-100 rounded-lg">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                <div className="flex items-center text-gray-900">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium">
                    {format(new Date(resident.dateOfBirth), 'MMMM d, yyyy')}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Sex</p>
                <p className="text-gray-900 font-medium">{resident.sex}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Civil Status</p>
                <p className="text-gray-900 font-medium">{resident.civilStatus}</p>
              </div>
              {resident.occupation && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Occupation</p>
                  <div className="flex items-center text-gray-900">
                    <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">{resident.occupation}</span>
                  </div>
                </div>
              )}
              {resident.education && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Education</p>
                  <div className="flex items-center text-gray-900">
                    <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">{resident.education}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Phone className="h-5 w-5 text-primary-600" />
              </div>
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                <div className="flex items-center text-gray-900">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium">{resident.contactNo}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <div className="flex items-start text-gray-900">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">{resident.address}</span>
                </div>
              </div>
              {resident.household && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Household</p>
                  <div className="flex items-center text-gray-900">
                    <Home className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">
                      {resident.household.householdNumber} - {resident.household.headName}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents Section */}
        {resident.documents && resident.documents.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 mt-4 sm:mt-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              Recent Documents
            </h2>
            <div className="space-y-3">
              {resident.documents.map((doc: any) => (
                <div
                  key={doc.documentNumber}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="font-medium text-gray-900">{doc.documentType}</p>
                    <p className="text-sm text-gray-500">
                      {doc.documentNumber} • {format(new Date(doc.issuedDate), 'MMM d, yyyy')}
                    </p>
                    {doc.purpose && (
                      <p className="text-xs text-gray-400 mt-1">{doc.purpose}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 pt-6 border-t border-gray-200">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <Shield className="h-4 w-4 text-primary-600" />
            <p className="text-sm font-medium text-gray-700">Barangay Information System</p>
          </div>
          <p className="text-xs text-gray-400 mt-3">Official Resident Information</p>
        </div>
      </div>
    </div>
  )
}

