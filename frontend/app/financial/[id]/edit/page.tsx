'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '@/lib/api'
import Layout from '@/components/Layout'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Upload, X, Receipt, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'

const FINANCIAL_TYPES = [
  { value: 'BUDGET', label: 'Budget' },
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'INCOME', label: 'Income' },
  { value: 'ALLOCATION', label: 'Allocation' },
]

export default function EditFinancialPage() {
  const router = useRouter()
  const params = useParams()
  const recordId = params.id as string
  const { hydrated } = useAuthStore()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [existingReceipt, setExistingReceipt] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    category: '',
    description: '',
    amount: '',
    date: '',
  })

  // Fetch record data
  const { data: record, isLoading: recordLoading } = useQuery(
    ['financial-record', recordId],
    async () => {
      const { data } = await api.get(`/financial/${recordId}`)
      return data
    },
    {
      enabled: !!recordId,
      onSuccess: (data) => {
        if (data) {
          setFormData({
            type: data.type || 'EXPENSE',
            category: data.category || '',
            description: data.description || '',
            amount: data.amount?.toString() || '',
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
          })
          if (data.receiptPath) {
            setExistingReceipt(data.receiptPath)
          }
        }
      }
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

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceipt(file)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setReceiptPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setReceiptPreview(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          submitData.append(key, value)
        }
      })

      // Append receipt only if a new one is selected
      if (receipt) {
        submitData.append('receipt', receipt)
      }

      await api.put(`/financial/${recordId}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('Financial record updated successfully!')
      queryClient.invalidateQueries('financial')
      queryClient.invalidateQueries('financial-summary')
      queryClient.invalidateQueries(['financial-record', recordId])
      router.push('/financial')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update financial record')
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

  if (recordLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading record data...</div>
        </div>
      </Layout>
    )
  }

  const displayReceipt = receiptPreview || existingReceipt

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/financial"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Financial Record</h1>
              <p className="mt-1 text-gray-600">Update financial record information</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Record Number (Read-only) */}
          {record && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Record Number
              </label>
              <p className="text-lg font-semibold text-gray-900">{record.recordNumber}</p>
            </div>
          )}

          {/* Record Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {FINANCIAL_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Office Supplies, Utilities, Revenue"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₱) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                placeholder="Provide a detailed description of this financial record..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Receipt</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Receipt (Optional)
              </label>
              {displayReceipt ? (
                <div className="mb-4">
                  {receiptPreview || (existingReceipt && existingReceipt.match(/\.(jpg|jpeg|png|gif)$/i)) ? (
                    <div className="relative inline-block">
                      <img
                        src={displayReceipt}
                        alt="Receipt preview"
                        className="h-48 rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setReceipt(null)
                          setReceiptPreview(null)
                          if (receiptPreview) {
                            setExistingReceipt(null)
                          }
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : existingReceipt ? (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center">
                        <Receipt className="h-5 w-5 text-gray-400 mr-2" />
                        <a
                          href={existingReceipt}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          View existing receipt
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : receipt ? (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <Receipt className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{receipt.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReceipt(null)
                      setReceiptPreview(null)
                    }}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
              <label className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors inline-block">
                <Upload className="h-4 w-4 mr-2" />
                {receipt ? 'Change Receipt' : 'Choose Receipt'}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleReceiptChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Maximum file size: 5MB. Supported formats: JPG, PNG, PDF
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Link
              href="/financial"
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}



