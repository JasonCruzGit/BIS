'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from 'react-query'
import portalApi from '@/lib/portal-api'
import toast from 'react-hot-toast'
import { ArrowLeft, MessageSquare, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function NewComplaintPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
  })

  const createMutation = useMutation(
    (data: any) => portalApi.post('/complaints', data),
    {
      onSuccess: () => {
        toast.success('Complaint/request submitted successfully!')
        router.push('/portal/dashboard')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to submit complaint')
      },
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
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
          <h1 className="text-2xl font-bold text-gray-900">Submit Complaint/Request</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of your complaint or request"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select category</option>
                <option value="General">General</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Services">Services</option>
                <option value="Safety">Safety & Security</option>
                <option value="Environment">Environment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                placeholder="Please provide detailed information about your complaint or request..."
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
                disabled={createMutation.isLoading}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium"
              >
                {createMutation.isLoading ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Your complaint/request will be reviewed by barangay staff</li>
                <li>You will receive updates on the status of your submission</li>
                <li>Staff may contact you for additional information if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

