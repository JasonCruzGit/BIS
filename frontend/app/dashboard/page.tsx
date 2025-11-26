'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import Layout from '@/components/Layout'
import { useQuery } from 'react-query'
import api from '@/lib/api'
import { 
  Users, 
  FileText, 
  AlertCircle, 
  Package, 
  Home,
  TrendingUp,
  ArrowRight,
  Calendar,
  Clock,
  Bell,
  Activity,
  Plus
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'

export default function DashboardPage() {
  const router = useRouter()
  const { user, hydrated } = useAuthStore()
  const [currentDate, setCurrentDate] = useState<string>('')
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    if (hydrated && !user) {
      router.push('/login')
    }
    if (typeof window !== 'undefined') {
      const updateDateTime = () => {
        const now = new Date()
        setCurrentDate(format(now, 'EEEE, MMMM d, yyyy'))
        setCurrentTime(format(now, 'hh:mm:ss a'))
      }
      
      // Update immediately
      updateDateTime()
      
      // Update every second
      const interval = setInterval(updateDateTime, 1000)
      
      return () => clearInterval(interval)
    }
  }, [user, router, hydrated])

  const { data: stats, isLoading: statsLoading } = useQuery('dashboard-stats', async () => {
    const [residents, households, documents, incidents, inventory] = await Promise.all([
      api.get('/residents?limit=1'),
      api.get('/households?limit=1'),
      api.get('/documents?limit=1'),
      api.get('/incidents?limit=1'),
      api.get('/inventory?limit=1'),
    ])
    return {
      residents: residents.data.pagination?.total || 0,
      households: households.data.pagination?.total || 0,
      documents: documents.data.pagination?.total || 0,
      incidents: incidents.data.pagination?.total || 0,
      inventory: inventory.data.pagination?.total || 0,
    }
  })

  const { data: announcements } = useQuery('active-announcements', async () => {
    try {
      const { data } = await api.get('/announcements/active')
      return data || []
    } catch {
      return []
    }
  })

  const { data: recentDocuments } = useQuery('recent-documents', async () => {
    try {
      const { data } = await api.get('/documents?limit=5')
      return data?.documents || []
    } catch {
      return []
    }
  })

  const { data: recentIncidents } = useQuery('recent-incidents', async () => {
    try {
      const { data } = await api.get('/incidents?limit=5')
      return data?.incidents || []
    } catch {
      return []
    }
  })

  // Mock chart data - in production, fetch from API
  const chartData = [
    { name: 'Jan', residents: 120, documents: 45, incidents: 8 },
    { name: 'Feb', residents: 135, documents: 52, incidents: 12 },
    { name: 'Mar', residents: 148, documents: 48, incidents: 10 },
    { name: 'Apr', residents: 162, documents: 61, incidents: 15 },
    { name: 'May', residents: 175, documents: 55, incidents: 9 },
    { name: 'Jun', residents: stats?.residents || 0, documents: stats?.documents || 0, incidents: stats?.incidents || 0 },
  ]

  const pieData = [
    { name: 'Residents', value: stats?.residents || 0, color: '#3b82f6' },
    { name: 'Households', value: stats?.households || 0, color: '#10b981' },
    { name: 'Documents', value: stats?.documents || 0, color: '#f59e0b' },
    { name: 'Incidents', value: stats?.incidents || 0, color: '#ef4444' },
  ]

  const statCards = [
    { 
      label: 'Total Residents', 
      value: stats?.residents || 0, 
      icon: Users, 
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      iconColor: 'text-white',
      link: '/residents',
      trend: '+12%',
      trendColor: 'text-green-600'
    },
    { 
      label: 'Households', 
      value: stats?.households || 0, 
      icon: Home, 
      gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
      bgGradient: 'from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-500',
      iconColor: 'text-white',
      link: '/households',
      trend: '+8%',
      trendColor: 'text-green-600'
    },
    { 
      label: 'Documents Issued', 
      value: stats?.documents || 0, 
      icon: FileText, 
      gradient: 'from-amber-500 via-amber-600 to-amber-700',
      bgGradient: 'from-amber-50 to-amber-100',
      iconBg: 'bg-amber-500',
      iconColor: 'text-white',
      link: '/documents',
      trend: '+15%',
      trendColor: 'text-green-600'
    },
    { 
      label: 'Active Incidents', 
      value: stats?.incidents || 0, 
      icon: AlertCircle, 
      gradient: 'from-rose-500 via-rose-600 to-rose-700',
      bgGradient: 'from-rose-50 to-rose-100',
      iconBg: 'bg-rose-500',
      iconColor: 'text-white',
      link: '/incidents',
      trend: '-5%',
      trendColor: 'text-green-600'
    },
    { 
      label: 'Inventory Items', 
      value: stats?.inventory || 0, 
      icon: Package, 
      gradient: 'from-indigo-500 via-indigo-600 to-indigo-700',
      bgGradient: 'from-indigo-50 to-indigo-100',
      iconBg: 'bg-indigo-500',
      iconColor: 'text-white',
      link: '/inventory',
      trend: '+3%',
      trendColor: 'text-green-600'
    },
  ]

  if (!hydrated || !user) {
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-lg text-gray-600">
              Welcome back, <span className="font-semibold text-primary-600">{user.firstName} {user.lastName}</span>!
            </p>
            {currentDate && (
              <div className="mt-2 flex items-center gap-4">
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {currentDate}
                </p>
                {currentTime && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg shadow-lg">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono font-bold text-lg">{currentTime}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Link
              href="/residents/new"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Resident
            </Link>
            <Link
              href="/documents/new"
              className="inline-flex items-center px-5 py-2.5 bg-white text-gray-700 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FileText className="h-4 w-4 mr-2" />
              Issue Document
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.label}
                href={stat.link}
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                      {statsLoading ? (
                        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                      ) : (
                        <p className="text-4xl font-bold text-gray-900 mb-3">{stat.value.toLocaleString()}</p>
                      )}
                      <div className="flex items-center text-xs">
                        <TrendingUp className={`h-3.5 w-3.5 mr-1.5 ${stat.trendColor}`} />
                        <span className={`font-semibold ${stat.trendColor}`}>{stat.trend}</span>
                        <span className="ml-1.5 text-gray-500">vs last month</span>
                      </div>
                    </div>
                    <div className={`${stat.iconBg} p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className={`h-7 w-7 ${stat.iconColor}`} />
                    </div>
                  </div>
                </div>
                
                {/* Bottom accent bar */}
                <div className={`h-1.5 bg-gradient-to-r ${stat.gradient} group-hover:h-2 transition-all duration-300`} />
                
                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary-600" />
                  Activity Overview
                </h2>
                <p className="text-sm text-gray-500 mt-1.5">Last 6 months</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '12px'
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="residents" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="documents" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                <Bar dataKey="incidents" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
                  Data Distribution
                </h2>
                <p className="text-sm text-gray-500 mt-1.5">Current statistics</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Documents */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                Recent Documents
              </h2>
              <Link href="/documents" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center group">
                View all
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentDocuments && recentDocuments.length > 0 ? (
                recentDocuments.map((doc: any) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-blue-50 hover:to-blue-100 border border-gray-100 hover:border-blue-200 transition-all duration-200 group"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-900">{doc.documentType.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500 mt-1 group-hover:text-blue-700">
                        {doc.resident?.firstName} {doc.resident?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-500 group-hover:text-blue-600">
                        {format(new Date(doc.issuedDate), 'MMM d')}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No recent documents</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                Recent Incidents
              </h2>
              <Link href="/incidents" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center group">
                View all
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentIncidents && recentIncidents.length > 0 ? (
                recentIncidents.map((incident: any) => (
                  <Link
                    key={incident.id}
                    href={`/incidents/${incident.id}`}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-red-50 hover:to-red-100 border border-gray-100 hover:border-red-200 transition-all duration-200 group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          incident.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                          incident.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {incident.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 group-hover:text-red-700">
                        {incident.complainant?.firstName} {incident.complainant?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-500 group-hover:text-red-600">
                        {format(new Date(incident.incidentDate), 'MMM d')}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No recent incidents</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Announcements */}
        {announcements && announcements.length > 0 && (
          <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-primary-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="p-2 bg-primary-600 rounded-lg mr-3">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                Announcements
              </h2>
              <Link href="/announcements" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center group">
                View all
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-4">
              {announcements.slice(0, 3).map((announcement: any) => (
                <div 
                  key={announcement.id} 
                  className="bg-white rounded-xl p-5 border-l-4 border-primary-500 shadow-md hover:shadow-lg transition-all duration-200 hover:border-primary-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900">{announcement.title}</h3>
                        {announcement.isPinned && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                            📌 Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1.5" />
                          {format(new Date(announcement.createdAt), 'h:mm a')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/residents/new"
              className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 group transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="p-3 bg-blue-500 rounded-xl mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Users className="h-7 w-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">Add Resident</span>
            </Link>
            <Link
              href="/documents/new"
              className="flex flex-col items-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl hover:from-amber-100 hover:to-amber-200 border-2 border-amber-200 hover:border-amber-300 transition-all duration-200 group transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="p-3 bg-amber-500 rounded-xl mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-amber-700">Issue Document</span>
            </Link>
            <Link
              href="/incidents/new"
              className="flex flex-col items-center p-6 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl hover:from-rose-100 hover:to-rose-200 border-2 border-rose-200 hover:border-rose-300 transition-all duration-200 group transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="p-3 bg-rose-500 rounded-xl mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-rose-700">Report Incident</span>
            </Link>
            <Link
              href="/announcements/new"
              className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-300 transition-all duration-200 group transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="p-3 bg-purple-500 rounded-xl mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Bell className="h-7 w-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700">New Announcement</span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

