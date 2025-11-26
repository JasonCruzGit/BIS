'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from 'react-query'
import portalApi from '@/lib/portal-api'
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, Download } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { getFileUrl } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function RequestDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params.id as string

  const { data: request, isLoading, error, refetch } = useQuery(
    ['request-details', requestId],
    async () => {
      const { data } = await portalApi.get(`/requests/${requestId}`)
      console.log('Request details loaded:', data)
      console.log('Document filePath:', data?.document?.filePath)
      
      // If document exists but no filePath, wait a bit and refetch (PDF might be generating)
      if (data?.document && !data.document.filePath && (data.status === 'APPROVED' || data.status === 'COMPLETED')) {
        setTimeout(() => {
          refetch()
        }, 2000)
      }
      
      return data
    },
    { enabled: !!requestId, refetchInterval: (data) => {
      // Refetch every 2 seconds if document exists but no filePath
      if (data?.document && !data.document.filePath && (data.status === 'APPROVED' || data.status === 'COMPLETED')) {
        return 2000
      }
      return false
    } }
  )

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
        return <CheckCircle className="h-5 w-5" />
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="h-5 w-5" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5" />
      default:
        return null
    }
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request not found</h2>
          <Link href="/portal/requests" className="text-primary-600 hover:text-primary-700">
            Back to Requests
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/portal/requests"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Request #{request.requestNumber}
              </h2>
              <p className="text-sm text-gray-600">
                Submitted on {format(new Date(request.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                request.status
              )}`}
            >
              {getStatusIcon(request.status)}
              {request.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Document Type</label>
              <p className="mt-1 text-gray-900">
                {request.documentType.replace('_', ' ')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Payment Status</label>
              <p className="mt-1 text-gray-900">{request.paymentStatus}</p>
            </div>
            {request.purpose && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Purpose</label>
                <p className="mt-1 text-gray-900">{request.purpose}</p>
              </div>
            )}
            {request.processedAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Processed Date</label>
                <p className="mt-1 text-gray-900">
                  {format(new Date(request.processedAt), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
            {request.processor && (
              <div>
                <label className="text-sm font-medium text-gray-500">Processed By</label>
                <p className="mt-1 text-gray-900">
                  {request.processor.firstName} {request.processor.lastName}
                </p>
              </div>
            )}
          </div>

          {request.rejectedReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-red-900 mb-1">Rejection Reason</h3>
              <p className="text-sm text-red-800">{request.rejectedReason}</p>
            </div>
          )}

          {request.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-1">Notes</h3>
              <p className="text-sm text-blue-800">{request.notes}</p>
            </div>
          )}

          {request.document && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-900 mb-1">Document Ready</h3>
                  <p className="text-sm text-green-800">
                    Document #{request.document.documentNumber} has been issued
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-gray-500 mt-1">
                      FilePath: {request.document.filePath || 'Not set'}
                    </p>
                  )}
                </div>
                {request.document.filePath ? (
                  <a
                    href={getFileUrl(request.document.filePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                ) : (
                  <div className="text-sm text-gray-500">
                    PDF generating...
                  </div>
                )}
              </div>
            </div>
          )}

          {request.status === 'APPROVED' && request.paymentStatus === 'UNPAID' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Request Approved</h3>
                <p className="text-sm text-blue-800">
                  {request.fee ? `Fee: ₱${Number(request.fee).toFixed(2)} - Payment can be made at the barangay office` : 'Your request has been approved. Please visit the barangay office to complete the process.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

