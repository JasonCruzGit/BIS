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
  Archive, 
  Eye, 
  Filter,
  Download,
  Grid,
  List,
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { getFileUrl } from '@/lib/utils'

export default function ResidentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedResident, setSelectedResident] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: residentsData, isLoading } = useQuery(
    ['residents', page, searchQuery, statusFilter],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (searchQuery) {
        params.append('q', searchQuery)
      }
      if (statusFilter) {
        // Note: API might need to support status filter
      }
      const { data } = await api.get(`/residents?${params}`)
      return data
    }
  )

  const { data: stats } = useQuery('residents-stats', async () => {
    const { data } = await api.get('/residents?limit=1')
    return {
      total: data.pagination?.total || 0,
      new: 0, // Calculate from data
      returning: 0,
      transferred: 0
    }
  })

  const archiveMutation = useMutation(
    (id: string) => api.patch(`/residents/${id}/archive`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('residents')
        toast.success('Resident archived successfully')
      },
      onError: () => {
        toast.error('Failed to archive resident')
      },
    }
  )

  const handleViewResident = (resident: any) => {
    setSelectedResident(resident)
    setShowViewModal(true)
  }

  const residents = residentsData?.residents || []
  const pagination = residentsData?.pagination

  return (
    <Layout>
      <div className="space-y-8 pb-8">
        {/* Enhanced Header with Gradient Background */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-3xl shadow-2xl p-8 text-white">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg">Residents</h1>
              </div>
              <p className="text-lg lg:text-xl text-white/90">
                Manage and view resident information
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/residents/new"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-700 rounded-xl hover:bg-white/90 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold group"
              >
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Add Resident
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Residents</p>
                  <p className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                    {stats?.total || 0}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                  <User className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 group-hover:h-2 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">New Residents</p>
                  <p className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                    {stats?.new || 0}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                  <User className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-green-500 to-green-600 group-hover:h-2 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Returning</p>
                  <p className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                    {stats?.returning || 0}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                  <User className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 group-hover:h-2 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Transferred</p>
                  <p className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                    {stats?.transferred || 0}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                  <User className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600 group-hover:h-2 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="relative bg-white rounded-3xl shadow-xl p-6 border border-gray-100 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, address, or contact number..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPage(1)
                  }}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-5 py-3 rounded-xl border-2 transition-all duration-200 font-semibold ${
                    showFilters || statusFilter
                      ? 'bg-primary-600 border-primary-600 text-white shadow-lg transform hover:scale-105'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
                <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-3 transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-primary-600 text-white shadow-lg' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-3 border-l-2 border-gray-200 transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-primary-600 text-white shadow-lg' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                </div>
                <button className="flex items-center px-5 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Enhanced Filter Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t-2 border-gray-200 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Residency Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value)
                        setPage(1)
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    >
                      <option value="">All Status</option>
                      <option value="NEW">New</option>
                      <option value="RETURNING">Returning</option>
                      <option value="TRANSFERRED">Transferred</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Civil Status
                    </label>
                    <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 focus:bg-white">
                      <option value="">All</option>
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                      <option value="WIDOWED">Widowed</option>
                      <option value="DIVORCED">Divorced</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setStatusFilter('')
                        setShowFilters(false)
                      }}
                      className="w-full px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-transparent hover:border-gray-300"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Residents List/Grid */}
        {isLoading ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center border border-gray-100">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
            <p className="mt-6 text-gray-600 font-medium">Loading residents...</p>
          </div>
        ) : residents.length > 0 ? (
          viewMode === 'list' ? (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Resident
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date of Birth
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-8 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {residents.map((resident: any) => (
                      <tr key={resident.id} className="hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 transition-all duration-200 group">
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mr-4 ring-2 ring-white shadow-md group-hover:scale-110 transition-transform duration-200">
                              {resident.idPhoto ? (
                                <img src={getFileUrl(resident.idPhoto)} alt="" className="h-12 w-12 rounded-full object-cover" />
                              ) : (
                                <User className="h-6 w-6 text-primary-600" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 group-hover:text-primary-900">
                                {resident.firstName} {resident.middleName} {resident.lastName} {resident.suffix}
                              </div>
                              <div className="text-xs text-gray-500 font-medium">{resident.civilStatus}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-700 font-medium">
                            <Phone className="h-4 w-4 mr-2 text-primary-500" />
                            {resident.contactNo}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center text-sm text-gray-700 font-medium max-w-xs truncate">
                            <MapPin className="h-4 w-4 mr-2 text-primary-500 flex-shrink-0" />
                            <span className="truncate">{resident.address}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-700 font-medium">
                            <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                            {format(new Date(resident.dateOfBirth), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className={`px-4 py-2 inline-flex text-xs font-bold rounded-full border-2 ${
                            resident.residencyStatus === 'NEW' ? 'bg-green-100 text-green-800 border-green-200' :
                            resident.residencyStatus === 'RETURNING' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>
                            {resident.residencyStatus}
                          </span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewResident(resident)}
                              className="p-2.5 text-primary-600 hover:bg-primary-100 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                              title="View"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <Link
                              href={`/residents/${resident.id}/edit`}
                              className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                              title="Edit"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to archive this resident?')) {
                                  archiveMutation.mutate(resident.id)
                                }
                              }}
                              className="p-2.5 text-yellow-600 hover:bg-yellow-100 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                              title="Archive"
                            >
                              <Archive className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {residents.map((resident: any) => (
                <div
                  key={resident.id}
                  className="group relative bg-white rounded-3xl shadow-lg border-2 border-gray-100 hover:shadow-2xl hover:border-primary-300 transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mr-4 ring-4 ring-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          {resident.idPhoto ? (
                            <img src={getFileUrl(resident.idPhoto)} alt="" className="h-20 w-20 rounded-full object-cover" />
                          ) : (
                            <User className="h-10 w-10 text-primary-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-900 mb-1">
                            {resident.firstName} {resident.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium">{resident.civilStatus}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 ${
                        resident.residencyStatus === 'NEW' ? 'bg-green-100 text-green-800 border-green-200' :
                        resident.residencyStatus === 'RETURNING' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {resident.residencyStatus}
                      </span>
                    </div>
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center text-sm text-gray-700 font-medium bg-gray-50 rounded-xl p-3 group-hover:bg-white transition-colors duration-200">
                        <Phone className="h-4 w-4 mr-3 text-primary-500" />
                        {resident.contactNo}
                      </div>
                      <div className="flex items-start text-sm text-gray-700 font-medium bg-gray-50 rounded-xl p-3 group-hover:bg-white transition-colors duration-200">
                        <MapPin className="h-4 w-4 mr-3 text-primary-500 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{resident.address}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700 font-medium bg-gray-50 rounded-xl p-3 group-hover:bg-white transition-colors duration-200">
                        <Calendar className="h-4 w-4 mr-3 text-primary-500" />
                        {format(new Date(resident.dateOfBirth), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-5 border-t-2 border-gray-200">
                      <button
                        onClick={() => handleViewResident(resident)}
                        className="flex-1 px-4 py-3 text-sm font-semibold text-primary-700 bg-primary-100 rounded-xl hover:bg-primary-200 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                      >
                        <Eye className="h-4 w-4 inline mr-2" />
                        View
                      </button>
                      <Link
                        href={`/residents/${resident.id}/edit`}
                        className="flex-1 px-4 py-3 text-sm font-semibold text-blue-700 bg-blue-100 rounded-xl hover:bg-blue-200 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md text-center"
                      >
                        <Edit className="h-4 w-4 inline mr-2" />
                        Edit
                      </Link>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center border border-gray-100">
            <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No residents found</h3>
            <p className="text-gray-600 mb-6 text-lg">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first resident'}
            </p>
            <Link
              href="/residents/new"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Resident
            </Link>
          </div>
        )}

        {/* Enhanced Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="flex items-center justify-between bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
            <div className="text-sm text-gray-700 font-medium">
              Showing <span className="font-bold text-primary-600">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-bold text-primary-600">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-bold text-primary-600">{pagination.total}</span> residents
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="px-5 py-2.5 text-sm font-semibold border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:hover:bg-white disabled:hover:border-gray-300"
              >
                <ChevronLeft className="h-4 w-4 inline mr-1" />
                Previous
              </button>
              <div className="px-5 py-2.5 text-sm font-bold text-gray-900 bg-gray-100 rounded-xl">
                Page {pagination.page} of {pagination.pages}
              </div>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-5 py-2.5 text-sm font-semibold border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:hover:bg-white disabled:hover:border-gray-300"
              >
                Next
                <ChevronRight className="h-4 w-4 inline ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Enhanced View Modal */}
        {showViewModal && selectedResident && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
              <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-indigo-700 text-white px-8 py-6 flex items-center justify-between border-b-2 border-primary-500">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <User className="h-6 w-6" />
                  </div>
                  Resident Details
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-8">
                <div className="flex items-start gap-8 mb-8">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 ring-4 ring-primary-200 shadow-xl">
                    {selectedResident.idPhoto ? (
                      <img src={getFileUrl(selectedResident.idPhoto)} alt="" className="h-32 w-32 rounded-full object-cover" />
                    ) : (
                      <User className="h-16 w-16 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-extrabold text-gray-900 mb-3">
                      {selectedResident.firstName} {selectedResident.middleName} {selectedResident.lastName} {selectedResident.suffix}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <span className={`px-4 py-2 text-sm font-bold rounded-full border-2 ${
                        selectedResident.residencyStatus === 'NEW' ? 'bg-green-100 text-green-800 border-green-200' :
                        selectedResident.residencyStatus === 'RETURNING' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {selectedResident.residencyStatus}
                      </span>
                      <span className="px-4 py-2 text-sm font-bold bg-gray-100 text-gray-800 rounded-full border-2 border-gray-200">
                        {selectedResident.civilStatus}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100">
                    <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-primary-100 rounded-lg">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                      Personal Information
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date of Birth</p>
                        <p className="text-sm font-bold text-gray-900">
                          {format(new Date(selectedResident.dateOfBirth), 'MMMM d, yyyy')}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sex</p>
                        <p className="text-sm font-bold text-gray-900">{selectedResident.sex}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Civil Status</p>
                        <p className="text-sm font-bold text-gray-900">{selectedResident.civilStatus}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100">
                    <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      Contact Information
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Contact Number</p>
                        <p className="text-sm font-bold text-gray-900">{selectedResident.contactNo}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Address</p>
                        <p className="text-sm font-bold text-gray-900">{selectedResident.address}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100">
                    <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      Additional Information
                    </h4>
                    <div className="space-y-4">
                      {selectedResident.occupation ? (
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Occupation</p>
                          <p className="text-sm font-bold text-gray-900">{selectedResident.occupation}</p>
                        </div>
                      ) : null}
                      {selectedResident.education ? (
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Education</p>
                          <p className="text-sm font-bold text-gray-900">{selectedResident.education}</p>
                        </div>
                      ) : null}
                      {!selectedResident.occupation && !selectedResident.education && (
                        <p className="text-sm text-gray-500 italic">No additional information available</p>
                      )}
                    </div>
                  </div>
                  {selectedResident.household && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100">
                      <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                        </div>
                        Household
                      </h4>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Household Number</p>
                        <p className="text-sm font-bold text-gray-900">{selectedResident.household.householdNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-8 pt-8 border-t-2 border-gray-200 flex gap-4">
                  <Link
                    href={`/residents/${selectedResident.id}/edit`}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                  >
                    Edit Resident
                  </Link>
                  <Link
                    href={`/documents?residentId=${selectedResident.id}`}
                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 text-center transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-1 font-semibold"
                  >
                    View Documents
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
