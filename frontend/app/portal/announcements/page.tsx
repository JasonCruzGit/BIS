'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'react-query'
import portalApi from '@/lib/portal-api'
import { ArrowLeft, Bell, Pin, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { getFileUrl } from '@/lib/utils'

export default function AnnouncementsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('portal_token')
      if (!token) {
        router.push('/portal/login')
      }
    }
  }, [router])

  const { data: announcementsData, isLoading } = useQuery(
    ['public-announcements', page],
    async () => {
      const { data } = await portalApi.get(`/announcements?page=${page}&limit=10`)
      return data
    }
  )

  const announcements = announcementsData?.announcements || []
  const pagination = announcementsData?.pagination

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'EVENT':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'NOTICE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'GENERAL':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/portal/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Barangay Announcements</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-500">Loading announcements...</p>
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement: any) => (
              <div
                key={announcement.id}
                className={`bg-white rounded-xl shadow-md border-2 transition-all duration-200 hover:shadow-lg ${
                  announcement.isPinned ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-200'
                } p-6`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      {announcement.isPinned && (
                        <Pin className="h-5 w-5 text-yellow-600 fill-yellow-600" />
                      )}
                      <h2 className="text-xl font-bold text-gray-900">
                        {announcement.title}
                      </h2>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                          announcement.type
                        )}`}
                      >
                        {announcement.type}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 gap-4 flex-wrap">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        {format(new Date(announcement.createdAt), 'MMMM d, yyyy')}
                      </span>
                      {announcement.startDate && (
                        <span>
                          Starts: {format(new Date(announcement.startDate), 'MMM d, yyyy')}
                        </span>
                      )}
                      {announcement.endDate && (
                        <span>
                          Ends: {format(new Date(announcement.endDate), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="prose max-w-none mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
                </div>
                {announcement.attachments && announcement.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                      {announcement.attachments.map((attachment: string, index: number) => (
                        <a
                          key={index}
                          href={getFileUrl(attachment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-1.5" />
                          Attachment {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements</h3>
            <p className="text-gray-600">There are no announcements at this time.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">
              Showing {pagination.page * pagination.limit - pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} announcements
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <div className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </div>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

