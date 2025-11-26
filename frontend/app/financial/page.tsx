'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '@/lib/api'
import Layout from '@/components/Layout'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Filter,
  Download,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'

const FINANCIAL_TYPES = [
  { value: 'BUDGET', label: 'Budget', color: 'bg-blue-100 text-blue-800', icon: Wallet },
  { value: 'EXPENSE', label: 'Expense', color: 'bg-red-100 text-red-800', icon: TrendingDown },
  { value: 'INCOME', label: 'Income', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  { value: 'ALLOCATION', label: 'Allocation', color: 'bg-purple-100 text-purple-800', icon: DollarSign },
]

export default function FinancialPage() {
  const { hydrated } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: financialData, isLoading } = useQuery(
    ['financial', page, searchQuery, typeFilter, categoryFilter, dateRange],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (typeFilter) {
        params.append('type', typeFilter)
      }
      if (categoryFilter) {
        params.append('category', categoryFilter)
      }
      if (dateRange.start) {
        params.append('startDate', dateRange.start)
      }
      if (dateRange.end) {
        params.append('endDate', dateRange.end)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      const { data } = await api.get(`/financial?${params}`)
      return data
    }
  )

  const { data: summary } = useQuery('financial-summary', async () => {
    try {
      const { data } = await api.get('/financial/summary')
      return data
    } catch {
      return {
        totalBudget: 0,
        totalExpenses: 0,
        totalIncome: 0,
        totalAllocations: 0,
      }
    }
  })

  const { data: stats } = useQuery('financial-stats', async () => {
    const [budget, expense, income, allocation] = await Promise.all([
      api.get('/financial?type=BUDGET&limit=1'),
      api.get('/financial?type=EXPENSE&limit=1'),
      api.get('/financial?type=INCOME&limit=1'),
      api.get('/financial?type=ALLOCATION&limit=1'),
    ])
    return {
      budget: budget.data.pagination?.total || 0,
      expense: expense.data.pagination?.total || 0,
      income: income.data.pagination?.total || 0,
      allocation: allocation.data.pagination?.total || 0,
    }
  })

  const deleteMutation = useMutation(
    (id: string) => api.delete(`/financial/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('financial')
        queryClient.invalidateQueries('financial-summary')
        toast.success('Financial record deleted successfully')
      },
      onError: () => {
        toast.error('Failed to delete financial record')
      },
    }
  )

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record)
    setShowViewModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this financial record?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ format: 'xlsx' })
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)
      
      const response = await api.get(`/financial/export?${params}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `financial-report-${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Financial report exported successfully')
    } catch (error: any) {
      toast.error('Failed to export financial report')
    }
  }

  const records = financialData?.records || []
  const pagination = financialData?.pagination

  useEffect(() => {
    if (hydrated && !useAuthStore.getState().user) {
      window.location.href = '/login'
    }
  }, [hydrated])

  const getTypeInfo = (type: string) => {
    return FINANCIAL_TYPES.find(t => t.value === type) || FINANCIAL_TYPES[0]
  }

  const netBalance = (summary?.totalIncome || 0) - (summary?.totalExpenses || 0)

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
            <p className="mt-2 text-gray-600">Manage barangay budget, expenses, and financial records</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Report
            </button>
            <Link
              href="/financial/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Record
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₱{Number(summary?.totalBudget || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ₱{Number(summary?.totalIncome || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  ₱{Number(summary?.totalExpenses || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Balance</p>
                <p className={`text-2xl font-bold mt-1 ${
                  netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₱{Number(netBalance).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by record number, description, or category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  showFilters || typeFilter || categoryFilter || dateRange.start || dateRange.end
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${
                    viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 border-l border-gray-300 ${
                    viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value)
                      setPage(1)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Types</option>
                    {FINANCIAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value)
                      setPage(1)
                    }}
                    placeholder="Filter by category..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => {
                      setDateRange(prev => ({ ...prev, start: e.target.value }))
                      setPage(1)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => {
                      setDateRange(prev => ({ ...prev, end: e.target.value }))
                      setPage(1)
                    }}
                    min={dateRange.start}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-4 flex items-end">
                  <button
                    onClick={() => {
                      setTypeFilter('')
                      setCategoryFilter('')
                      setDateRange({ start: '', end: '' })
                      setShowFilters(false)
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Financial Records List/Grid */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-500">Loading financial records...</p>
          </div>
        ) : records.length > 0 ? (
          viewMode === 'list' ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Record Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record: any) => {
                      const typeInfo = getTypeInfo(record.type)
                      const Icon = typeInfo.icon
                      return (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {record.recordNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${typeInfo.color}`}>
                              <Icon className="h-3 w-3 mr-1" />
                              {typeInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{record.category}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {record.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-semibold ${
                              record.type === 'EXPENSE' ? 'text-red-600' :
                              record.type === 'INCOME' ? 'text-green-600' :
                              'text-gray-900'
                            }`}>
                              {record.type === 'EXPENSE' ? '-' : record.type === 'INCOME' ? '+' : ''}
                              ₱{Number(record.amount).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                              {format(new Date(record.date), 'MMM d, yyyy')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewRecord(record)}
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <Link
                                href={`/financial/${record.id}/edit`}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {records.map((record: any) => {
                const typeInfo = getTypeInfo(record.type)
                const Icon = typeInfo.icon
                return (
                  <div
                    key={record.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {record.recordNumber}
                          </h3>
                          <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${typeInfo.color}`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {typeInfo.label}
                          </span>
                        </div>
                        <div className="p-2 bg-primary-50 rounded-lg">
                          <DollarSign className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="text-sm font-medium text-gray-900">{record.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className={`text-lg font-bold ${
                            record.type === 'EXPENSE' ? 'text-red-600' :
                            record.type === 'INCOME' ? 'text-green-600' :
                            'text-gray-900'
                          }`}>
                            {record.type === 'EXPENSE' ? '-' : record.type === 'INCOME' ? '+' : ''}
                            ₱{Number(record.amount).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {format(new Date(record.date), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {record.description}
                      </p>
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleViewRecord(record)}
                          className="flex-1 px-3 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          <Eye className="h-4 w-4 inline mr-1" />
                          View
                        </button>
                        <Link
                          href={`/financial/${record.id}/edit`}
                          className="flex-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
                        >
                          <Edit className="h-4 w-4 inline mr-1" />
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No financial records found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first financial record'}
            </p>
            <Link
              href="/financial/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Record
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-medium">{pagination.total}</span> records
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 inline" />
                Previous
              </button>
              <div className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </div>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 inline" />
              </button>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Financial Record Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {selectedRecord.recordNumber}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Created on {format(new Date(selectedRecord.createdAt), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    {(() => {
                      const typeInfo = getTypeInfo(selectedRecord.type)
                      const Icon = typeInfo.icon
                      return (
                        <span className={`px-4 py-2 text-sm font-medium rounded-full flex items-center ${typeInfo.color}`}>
                          <Icon className="h-4 w-4 mr-2" />
                          {typeInfo.label}
                        </span>
                      )
                    })()}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Record Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedRecord.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className={`text-2xl font-bold ${
                          selectedRecord.type === 'EXPENSE' ? 'text-red-600' :
                          selectedRecord.type === 'INCOME' ? 'text-green-600' :
                          'text-gray-900'
                        }`}>
                          {selectedRecord.type === 'EXPENSE' ? '-' : selectedRecord.type === 'INCOME' ? '+' : ''}
                          ₱{Number(selectedRecord.amount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {format(new Date(selectedRecord.date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Created By</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedRecord.creator?.firstName} {selectedRecord.creator?.lastName}
                        </p>
                      </div>
                      {selectedRecord.receiptPath && (
                        <div>
                          <p className="text-xs text-gray-500">Receipt</p>
                          <a
                            href={selectedRecord.receiptPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-primary-600 hover:text-primary-700 mt-1"
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            View Receipt
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Description</h4>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedRecord.description}
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                  <Link
                    href={`/financial/${selectedRecord.id}/edit`}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center transition-colors"
                  >
                    Edit Record
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}



