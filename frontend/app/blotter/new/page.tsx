'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import api from '@/lib/api'
import Layout from '@/components/Layout'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Search, User, X } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'

const BLOTTER_CATEGORIES = [
  { value: 'DOMESTIC_DISPUTE', label: 'Domestic Dispute' },
  { value: 'THEFT', label: 'Theft' },
  { value: 'BARANGAY_DISPUTE', label: 'Barangay Dispute' },
  { value: 'YOUTH_RELATED', label: 'Youth Related' },
  { value: 'PROPERTY_DISPUTE', label: 'Property Dispute' },
  { value: 'OTHER', label: 'Other' },
]

const BLOTTER_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
]

export default function NewBlotterPage() {
  const router = useRouter()
  const { hydrated } = useAuthStore()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [residentSearch, setResidentSearch] = useState('')
  const [selectedResident, setSelectedResident] = useState<any>(null)
  const [showResidentSearch, setShowResidentSearch] = useState(false)

  const [formData, setFormData] = useState({
    residentId: '',
    category: 'DOMESTIC_DISPUTE',
    narrative: '',
    incidentDate: '',
    status: 'OPEN',
    actionsTaken: '',
  })

  // Search residents
  const { data: residentsData } = useQuery(
    ['residents-search', residentSearch],
    async () => {
      if (!residentSearch || residentSearch.length < 2) return { residents: [] }
      const { data } = await api.get(`/residents?search=${residentSearch}&limit=10`)
      return data
    },
    {
      enabled: showResidentSearch && residentSearch.length >= 2,
    }
  )

  useEffect(() => {
    if (hydrated && !useAuthStore.getState().user) {
      router.push('/login')
    }
  }, [hydrated, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleResidentSelect = (resident: any) => {
    setSelectedResident(resident)
    setFormData(prev => ({ ...prev, residentId: resident.id }))
    setShowResidentSearch(false)
    setResidentSearch('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.residentId) {
      toast.error('Please select a resident')
      return
    }

    setLoading(true)

    try {
      await api.post('/blotter', formData)

      toast.success('Blotter entry created successfully!')
      queryClient.invalidateQueries('blotter')
      router.push('/blotter')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create blotter entry')
    } finally {
      setLoading(false)
    }
  }

  if (!hydrated) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    )
  }

  const residents = residentsData?.residents || []

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/blotter"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">New Blotter Entry</h1>
              <p className="mt-1 text-gray-600">Create a new barangay blotter entry</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Resident Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resident Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Resident <span className="text-red-500">*</span>
              </label>
              {selectedResident ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedResident.firstName} {selectedResident.lastName}
                      </p>
                      {selectedResident.address && (
                        <p className="text-xs text-gray-500">{selectedResident.address}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedResident(null)
                      setFormData(prev => ({ ...prev, residentId: '' }))
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for resident by name..."
                      value={residentSearch}
                      onChange={(e) => {
                        setResidentSearch(e.target.value)
                        setShowResidentSearch(true)
                      }}
                      onFocus={() => setShowResidentSearch(true)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  {showResidentSearch && residents.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {residents.map((resident: any) => (
                        <button
                          key={resident.id}
                          type="button"
                          onClick={() => handleResidentSelect(resident)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                              <User className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {resident.firstName} {resident.lastName}
                              </p>
                              {resident.address && (
                                <p className="text-xs text-gray-500">{resident.address}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showResidentSearch && residentSearch.length >= 2 && residents.length === 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                      <p className="text-sm text-gray-500">No residents found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Entry Information */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Entry Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {BLOTTER_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {BLOTTER_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Narrative */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Narrative</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Narrative <span className="text-red-500">*</span>
              </label>
              <textarea
                name="narrative"
                value={formData.narrative}
                onChange={handleInputChange}
                required
                rows={8}
                placeholder="Provide a detailed description of the incident..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Actions Taken */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Taken</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actions Taken (Optional)
              </label>
              <textarea
                name="actionsTaken"
                value={formData.actionsTaken}
                onChange={handleInputChange}
                rows={6}
                placeholder="Describe any actions taken regarding this incident..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Link
              href="/blotter"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}



