'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '@/lib/api'
import Layout from '@/components/Layout'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Search, Upload, X, AlertCircle, FileText, Users, Calendar, FileEdit, CheckCircle2, Paperclip } from 'lucide-react'
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Enhanced Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-xl shadow-lg p-6 border border-primary-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl"></div>
          
          <div className="relative flex items-center gap-4">
            <Link
              href="/incidents"
              className="p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-colors border border-white/20"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Report Incident</h1>
              <p className="text-white/90 text-sm">Create a new incident report</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-8">
          {/* Parties Involved Section */}
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Parties Involved</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Complainant */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Complainant <span className="text-red-500">*</span>
                </label>
                {selectedComplainant ? (
                  <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {selectedComplainant.firstName} {selectedComplainant.lastName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{selectedComplainant.address}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedComplainant(null)
                          setFormData(prev => ({ ...prev, complainantId: '' }))
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search complainant..."
                      value={complainantSearch}
                      onChange={(e) => {
                        setComplainantSearch(e.target.value)
                        setShowComplainantSearch(true)
                      }}
                      onFocus={() => setShowComplainantSearch(true)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                    />
                    {showComplainantSearch && complainantResults && complainantResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {complainantResults.map((resident: any) => (
                          <button
                            key={resident.id}
                            type="button"
                            onClick={() => handleSelectComplainant(resident)}
                            className="w-full px-4 py-3 text-left hover:bg-primary-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <p className="font-semibold text-gray-900">
                              {resident.firstName} {resident.lastName}
                            </p>
                            <p className="text-sm text-gray-600 mt-0.5">{resident.address}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Respondent */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Respondent (Optional)
                </label>
                {selectedRespondent ? (
                  <div className="p-5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {selectedRespondent.firstName} {selectedRespondent.lastName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{selectedRespondent.address}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRespondent(null)
                          setFormData(prev => ({ ...prev, respondentId: '' }))
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search respondent..."
                      value={respondentSearch}
                      onChange={(e) => {
                        setRespondentSearch(e.target.value)
                        setShowRespondentSearch(true)
                      }}
                      onFocus={() => setShowRespondentSearch(true)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                    />
                    {showRespondentSearch && respondentResults && respondentResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {respondentResults.map((resident: any) => (
                          <button
                            key={resident.id}
                            type="button"
                            onClick={() => handleSelectRespondent(resident)}
                            className="w-full px-4 py-3 text-left hover:bg-primary-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <p className="font-semibold text-gray-900">
                              {resident.firstName} {resident.lastName}
                            </p>
                            <p className="text-sm text-gray-600 mt-0.5">{resident.address}</p>
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
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Incident Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1.5" />
                  Incident Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1.5" />
                  Hearing Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  name="hearingDate"
                  value={formData.hearingDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Narrative Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileEdit className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Narrative</h2>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Incident Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="narrative"
                value={formData.narrative}
                onChange={handleInputChange}
                required
                rows={6}
                placeholder="Provide a detailed description of the incident..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white resize-none"
              />
            </div>
          </div>

          {/* Actions Taken Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-primary-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Actions Taken</h2>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Actions Taken (Optional)
              </label>
              <textarea
                name="actionsTaken"
                value={formData.actionsTaken}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe any actions taken regarding this incident..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white resize-none"
              />
            </div>
          </div>

          {/* Attachments Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Paperclip className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Attachments</h2>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload Files (Photos, Documents)
              </label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center px-5 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg font-semibold">
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
                  {attachments.length > 0 && (
                    <span className="text-sm font-semibold text-gray-700 px-3 py-2 bg-gray-100 rounded-lg">
                      {attachments.length} file(s) selected
                    </span>
                  )}
                </div>
                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {attachments.map((file, index) => (
                      <div key={index} className="relative group">
                        {file.type.startsWith('image/') && attachmentPreviews[index] ? (
                          <div className="relative">
                            <img
                              src={attachmentPreviews[index]}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-28 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-primary-300 transition-colors">
                            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-600 truncate font-medium">{file.name}</p>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Note:</span> Maximum file size: 5MB per file. Supported formats: Images, PDF, DOC, DOCX
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t-2 border-gray-200">
            <Link
              href="/incidents"
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
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



