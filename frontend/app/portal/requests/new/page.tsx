'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import portalApi from '@/lib/portal-api'
import toast from 'react-hot-toast'
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function NewRequestPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    documentType: '',
    purpose: '',
  })

  const { data: documentTypes } = useQuery('document-types', async () => {
    const { data } = await portalApi.get('/document-types')
    return data?.types || []
  })

  const createMutation = useMutation(
    async (data: any) => {
      console.log('Submitting request with data:', data)
      const response = await portalApi.post('/requests', data)
      return response.data
    },
    {
      onSuccess: (data) => {
        console.log('Request submitted successfully:', data)
        queryClient.invalidateQueries('my-requests')
        toast.success('Document request submitted successfully!')
        router.push('/portal/requests')
      },
      onError: (error: any) => {
        console.error('Error submitting request:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to submit request'
        toast.error(errorMessage)
      },
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.documentType) {
      toast.error('Please select a document type')
      return
    }
    
    console.log('Form submitted, documentType:', formData.documentType)
    
    try {
      createMutation.mutate({
        documentType: formData.documentType,
        purpose: formData.purpose || undefined,
      })
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast.error('An error occurred while submitting the request')
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
          <h1 className="text-2xl font-bold text-gray-900">Request Document</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type *
              </label>
              <select
                required
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select document type</option>
                {documentTypes?.map((type: any) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose (Optional)
              </label>
              <textarea
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                rows={4}
                placeholder="Please specify the purpose of this document..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Link
                href="/portal/dashboard"
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createMutation.isLoading || !formData.documentType}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {createMutation.isLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Request Process</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Your request will be reviewed by barangay staff</li>
                <li>You will be notified once your request is approved or rejected</li>
                <li>If approved, you can pay the required fees online</li>
                <li>Once payment is confirmed, your document will be processed</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

