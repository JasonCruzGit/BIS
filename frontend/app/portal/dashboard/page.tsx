'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'react-query'
import portalApi from '@/lib/portal-api'
import toast from 'react-hot-toast'
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Plus,
  Eye,
  Download,
  MessageSquare,
  LogOut,
  User,
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { getFileUrl } from '@/lib/utils'

export default function PortalDashboardPage() {
  const router = useRouter()
  const [resident, setResident] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const residentData = localStorage.getItem('portal_resident')
      const token = localStorage.getItem('portal_token')
      
      if (!token || !residentData) {
        router.push('/portal/login')
        return
      }

      setResident(JSON.parse(residentData))
    }
  }, [router])

  const { data: requestsData, isLoading: requestsLoading } = useQuery(
    'my-requests',
    async () => {
      const { data } = await portalApi.get('/requests?limit=5')
      return data
    },
    { enabled: !!resident }
  )

  const { data: documentsData, isLoading: documentsLoading } = useQuery(
    'my-documents',
    async () => {
      const { data } = await portalApi.get('/documents?limit=5')
      return data
    },
    { enabled: !!resident }
  )

  const { data: announcementsData } = useQuery('public-announcements', async () => {
    const { data } = await portalApi.get('/announcements?limit=5')
    return data
  })

  const handleLogout = () => {
    localStorage.removeItem('portal_token')
    localStorage.removeItem('portal_resident')
    router.push('/portal/login')
    toast.success('Logged out successfully')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  if (!resident) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resident Portal</h1>
              <p className="text-sm text-gray-600">
                Welcome, {resident.firstName} {resident.lastName}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/portal/requests/new"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg mr-4">
                <Plus className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Request Document</h3>
                <p className="text-sm text-gray-600">Submit a new document request</p>
              </div>
            </div>
          </Link>

          <Link
            href="/portal/complaints/new"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg mr-4">
                <MessageSquare className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Submit Complaint</h3>
                <p className="text-sm text-gray-600">File a complaint or request</p>
              </div>
            </div>
          </Link>

          <Link
            href="/portal/announcements"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Announcements</h3>
                <p className="text-sm text-gray-600">View barangay announcements</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
              <Link
                href="/portal/requests"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {requestsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : requestsData?.requests?.length > 0 ? (
                <div className="space-y-4">
                  {requestsData.requests.map((request: any) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {request.documentType.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Request #{request.requestNumber}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(request.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          {request.status}
                        </span>
                        <Link
                          href={`/portal/requests/${request.id}`}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No requests yet</p>
                  <Link
                    href="/portal/requests/new"
                    className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
                  >
                    Create your first request
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Issued Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Issued Documents</h2>
              <Link
                href="/portal/documents"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {documentsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : documentsData?.documents?.length > 0 ? (
                <div className="space-y-4">
                  {documentsData.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {doc.documentType.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Doc #{doc.documentNumber}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Issued: {format(new Date(doc.issuedDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {doc.filePath && (
                        <a
                          href={getFileUrl(doc.filePath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No documents issued yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Latest Announcements</h2>
            <Link
              href="/portal/announcements"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {announcementsData?.announcements?.length > 0 ? (
              <div className="space-y-4">
                {announcementsData.announcements.map((announcement: any) => (
                  <div
                    key={announcement.id}
                    className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                      {announcement.isPinned && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No announcements at this time</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

