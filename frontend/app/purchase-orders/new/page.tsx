'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '@/lib/api'
import Layout from '@/components/Layout'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, X, Calendar, DollarSign, FileText } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const { hydrated } = useAuthStore()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    purchaseRequestId: '',
    quotationId: '',
    deliveryTerms: '',
    paymentTerms: '',
    deliveryDate: '',
    totalAmount: '',
    remarks: '',
  })

  const [selectedPurchaseRequest, setSelectedPurchaseRequest] = useState<any>(null)
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null)
  const [showPurchaseRequestSearch, setShowPurchaseRequestSearch] = useState(false)
  const [showQuotationSearch, setShowQuotationSearch] = useState(false)

  // Fetch purchase requests available for quotation
  const { data: purchaseRequestsData } = useQuery(
    'purchase-requests-for-quotation',
    async () => {
      const { data } = await api.get('/purchase-requests?status=FOR_QUOTATION')
      return data
    }
  )

  // Fetch quotations for selected purchase request
  const { data: quotationsData } = useQuery(
    ['quotations', formData.purchaseRequestId],
    async () => {
      if (!formData.purchaseRequestId) return { quotations: [] }
      const { data } = await api.get(`/quotations?purchaseRequestId=${formData.purchaseRequestId}&status=APPROVED`)
      return data
    },
    {
      enabled: !!formData.purchaseRequestId,
    }
  )

  useEffect(() => {
    if (hydrated && !useAuthStore.getState().user) {
      router.push('/login')
    }
  }, [hydrated, router])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.relative')) {
        setShowPurchaseRequestSearch(false)
        setShowQuotationSearch(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Auto-fill total amount when quotation is selected
  useEffect(() => {
    if (selectedQuotation) {
      setFormData(prev => ({
        ...prev,
        quotationId: selectedQuotation.id,
        totalAmount: selectedQuotation.amount?.toString() || '',
      }))
    }
  }, [selectedQuotation])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePurchaseRequestSelect = (purchaseRequest: any) => {
    setSelectedPurchaseRequest(purchaseRequest)
    setFormData(prev => ({ ...prev, purchaseRequestId: purchaseRequest.id }))
    setShowPurchaseRequestSearch(false)
    // Reset quotation when purchase request changes
    setSelectedQuotation(null)
    setFormData(prev => ({ ...prev, quotationId: '', totalAmount: '' }))
  }

  const handleQuotationSelect = (quotation: any) => {
    setSelectedQuotation(quotation)
    setFormData(prev => ({
      ...prev,
      quotationId: quotation.id,
      totalAmount: quotation.amount?.toString() || '',
      deliveryTerms: quotation.deliveryTerms || '',
      paymentTerms: quotation.paymentTerms || '',
    }))
    setShowQuotationSearch(false)
  }

  // Form validation
  const isFormValid = 
    formData.purchaseRequestId && 
    formData.quotationId && 
    formData.deliveryDate && 
    formData.totalAmount &&
    parseFloat(formData.totalAmount) > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const submitData = {
        purchaseRequestId: formData.purchaseRequestId,
        quotationId: formData.quotationId,
        deliveryTerms: formData.deliveryTerms || null,
        paymentTerms: formData.paymentTerms || null,
        deliveryDate: formData.deliveryDate,
        totalAmount: parseFloat(formData.totalAmount),
        remarks: formData.remarks || null,
      }

      await api.post('/purchase-orders', submitData)

      toast.success('Purchase order created successfully!')
      queryClient.invalidateQueries('purchase-orders')
      queryClient.invalidateQueries('purchase-requests')
      router.push('/purchase-orders')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create purchase order')
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

  const purchaseRequests = purchaseRequestsData?.purchaseRequests || []
  const quotations = quotationsData?.quotations || []

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/purchase-orders"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Purchase Orders
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">New Purchase Order</h1>
            <p className="text-gray-600 mt-1">Create a new purchase order from approved quotation</p>
          </div>
          <Link
            href="/purchase-orders"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Purchase Request Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Request <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedPurchaseRequest ? `${selectedPurchaseRequest.requestNumber} - ${selectedPurchaseRequest.description || 'N/A'}` : ''}
                placeholder="Select purchase request..."
                readOnly
                onClick={() => setShowPurchaseRequestSearch(!showPurchaseRequestSearch)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
              />
              {selectedPurchaseRequest && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPurchaseRequest(null)
                    setFormData(prev => ({ ...prev, purchaseRequestId: '', quotationId: '', totalAmount: '' }))
                    setSelectedQuotation(null)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {showPurchaseRequestSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {purchaseRequests.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">No purchase requests available</div>
                  ) : (
                    purchaseRequests.map((pr: any) => (
                      <button
                        key={pr.id}
                        type="button"
                        onClick={() => handlePurchaseRequestSelect(pr)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{pr.requestNumber}</div>
                        <div className="text-sm text-gray-500">{pr.description || 'N/A'}</div>
                        <div className="text-xs text-gray-400 mt-1">Status: {pr.status}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {purchaseRequests.length} purchase request{purchaseRequests.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Quotation Selection */}
          {formData.purchaseRequestId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Quotation <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedQuotation ? `${selectedQuotation.supplierName || 'N/A'}` : ''}
                  placeholder="Select quotation..."
                  readOnly
                  onClick={() => setShowQuotationSearch(!showQuotationSearch)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
                />
                {selectedQuotation && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedQuotation(null)
                      setFormData(prev => ({ ...prev, quotationId: '', totalAmount: '', deliveryTerms: '', paymentTerms: '' }))
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {showQuotationSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {quotations.length === 0 ? (
                      <div className="p-4 text-gray-500 text-center">No approved quotations available</div>
                    ) : (
                      quotations.map((quotation: any) => (
                        <button
                          key={quotation.id}
                          type="button"
                          onClick={() => handleQuotationSelect(quotation)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{quotation.supplierName || 'N/A'}</div>
                              <div className="text-sm text-gray-500">
                                RFQ: {quotation.rfqNumber || 'N/A'} • Amount: ₱{quotation.amount?.toLocaleString() || '0.00'}
                              </div>
                            </div>
                            {quotation.isLowestBid && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                Lowest Bid
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Terms
              </label>
              <input
                type="text"
                name="deliveryTerms"
                value={formData.deliveryTerms}
                onChange={handleInputChange}
                placeholder="e.g., CIF, FOB"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <input
                type="text"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                placeholder="e.g., Net 30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Delivery Date and Total Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={4}
              placeholder="Additional notes or remarks..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Link
              href="/purchase-orders"
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Purchase Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

