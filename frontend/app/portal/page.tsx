'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, MessageSquare, Bell, LogIn, CheckCircle } from 'lucide-react'

export default function PortalLandingPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if already logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('portal_token')
      if (token) {
        router.push('/portal/dashboard')
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resident Portal</h1>
          <p className="text-xl text-gray-600">
            Access your documents and barangay services online
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="p-3 bg-primary-100 rounded-lg w-fit mb-4">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Documents</h3>
            <p className="text-gray-600 text-sm">
              Submit document requests online and track their status in real-time
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="p-3 bg-red-100 rounded-lg w-fit mb-4">
              <MessageSquare className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Complaints</h3>
            <p className="text-gray-600 text-sm">
              File complaints or requests directly to the barangay office
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Announcements</h3>
            <p className="text-gray-600 text-sm">
              Stay updated with the latest barangay announcements and events
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Features</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Request Documents Online</h3>
                <p className="text-sm text-gray-600">
                  Request barangay documents like certificates, clearances, and more
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Track Request Status</h3>
                <p className="text-sm text-gray-600">
                  Monitor the status of your document requests in real-time
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">View Issued Documents</h3>
                <p className="text-sm text-gray-600">
                  Access and download your previously issued documents
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Pay Fees Online</h3>
                <p className="text-sm text-gray-600">
                  Pay document fees securely through integrated payment gateways
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Submit Complaints</h3>
                <p className="text-sm text-gray-600">
                  File complaints or requests directly to the barangay office
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">View Announcements</h3>
                <p className="text-sm text-gray-600">
                  Stay informed about barangay events, programs, and important notices
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/portal/login"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-lg"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Access Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

