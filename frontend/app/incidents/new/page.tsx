'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '@/lib/api'
import Layout from '@/components/Layout'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Search, Upload, X, AlertCircle, FileText } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'

export default function NewIncidentPage() {
  const router = useRouter()
  const { hydrated } = useAuthStore()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [complainantSearch, setComplainantSearch] = useState('')
  const [respondentSearch, setRespondentSearch] = useState('')
  const [selectedComplainant, setSelectedComplainant] = useState<any>(null)
  const [selectedRespondent, setSelectedRespondent] = useState<any>(null)
  const [showComplainantSearch, setShowComplainantSearch] = useState(false)
  const [showRespondentSearch, setShowRespondentSearch] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([])

  const [formData, setFormData] = useState({
    complainantId: '',
    respondentId: '',
    narrative: '',
    incidentDate: '',
    actionsTaken: '',
    status: 'PENDING',
    hearingDate: '',
  })

  // Search residents
  const { data: complainantResults } = useQuery(
    ['search-complainant', complainantSearch],
    async () => {
      if (complainantSearch.length < 2) return []
      const { data } = await api.get(`/residents/search?q=${complainantSearch}`)
      return data || []
    },
    {
      enabled: complainantSearch.length >= 2 && showComplainantSearch,
    }
  )

  const { data: respondentResults } = useQuery(
    ['search-respondent', respondentSearch],
    async () => {
      if (respondentSearch.length < 2) return []
      const { data } = await api.get(`/residents/search?q=${respondentSearch}`)
      return data || []
    },
    {
      enabled: respondentSearch.length >= 2 && showRespondentSearch,
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

  const handleSelectComplainant = (resident: any) => {
    setSelectedComplainant(resident)
    setFormData(prev => ({ ...prev, complainantId: resident.id }))
    setComplainantSearch('')
    setShowComplainantSearch(false)
  }

  const handleSelectRespondent = (resident: any) => {
    setSelectedRespondent(resident)
    setFormData(prev => ({ ...prev, respondentId: resident.id }))
    setRespondentSearch('')
    setShowRespondentSearch(false)
  }

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newFiles = [...attachments, ...files]
    setAttachments(newFiles)

    // Create previews
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setAttachmentPreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          submitData.append(key, value)
        }
      })

      // Append attachments
      attachments.forEach((file) => {
        submitData.append('attachments', file)
      })

      await api.post('/incidents', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('Incident reported successfully!')
      queryClient.invalidateQueries('incidents')
      router.push('/incidents')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to report incident')
    } finally {
      setLoading(false)
    }
  }

  // Check if form is valid
  const isFormValid = selectedComplainant && 
                      formData.incidentDate && 
                      formData.narrative?.trim()

  if (!hydrated) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/incidents"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Report Incident</h1>
              <p className="mt-1 text-gray-600">Create a new incident report</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Parties Involved Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Parties Involved</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Complainant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complainant <span className="text-red-500">*</span>
                </label>
                {selectedComplainant ? (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedComplainant.firstName} {selectedComplainant.lastName}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{selectedComplainant.address}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedComplainant(null)
                          setFormData(prev => ({ ...prev, complainantId: '' }))
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search complainant..."
                      value={complainantSearch}
                      onChange={(e) => {
                        setComplainantSearch(e.target.value)
                        setShowComplainantSearch(true)
                      }}
                      onFocus={() => setShowComplainantSearch(true)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {showComplainantSearch && complainantResults && complainantResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {complainantResults.map((resident: any) => (
                          <button
                            key={resident.id}
                            type="button"
                            onClick={() => handleSelectComplainant(resident)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <p className="font-medium text-gray-900">
                              {resident.firstName} {resident.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{resident.address}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Respondent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Respondent (Optional)
                </label>
                {selectedRespondent ? (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedRespondent.firstName} {selectedRespondent.lastName}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{selectedRespondent.address}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRespondent(null)
                          setFormData(prev => ({ ...prev, respondentId: '' }))
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search respondent..."
                      value={respondentSearch}
                      onChange={(e) => {
                        setRespondentSearch(e.target.value)
                        setShowRespondentSearch(true)
                      }}
                      onFocus={() => setShowRespondentSearch(true)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {showRespondentSearch && respondentResults && respondentResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {respondentResults.map((resident: any) => (
                          <button
                            key={resident.id}
                            type="button"
                            onClick={() => handleSelectRespondent(resident)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <p className="font-medium text-gray-900">
                              {resident.firstName} {resident.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{resident.address}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Incident Details Section */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Incident Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Date & Time <span className="text-red-500">*</span>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hearing Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  name="hearingDate"
                  value={formData.hearingDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Narrative Section */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Narrative</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="narrative"
                value={formData.narrative}
                onChange={handleInputChange}
                required
                rows={6}
                placeholder="Provide a detailed description of the incident..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Actions Taken Section */}
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
                rows={4}
                placeholder="Describe any actions taken regarding this incident..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Attachments Section */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files (Photos, Documents)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleAttachmentChange}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-500">
                  {attachments.length} file(s) selected
                </span>
              </div>
              {attachments.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {attachments.map((file, index) => (
                    <div key={index} className="relative">
                      {file.type.startsWith('image/') && attachmentPreviews[index] ? (
                        <div className="relative">
                          <img
                            src={attachmentPreviews[index]}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-600 truncate">{file.name}</p>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Maximum file size: 5MB per file. Supported formats: Images, PDF, DOC, DOCX
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Link
              href="/incidents"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report Incident
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}



