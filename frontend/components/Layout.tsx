'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import {
  LayoutDashboard,
  Users,
  FileText,
  Home,
  AlertCircle,
  FolderKanban,
  UserCheck,
  BookOpen,
  Megaphone,
  Package,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Shield,
  MessageSquare,
  User
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/residents', label: 'Residents', icon: Users },
  { href: '/households', label: 'Households', icon: Home },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/incidents', label: 'Incidents', icon: AlertCircle },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/officials', label: 'Officials', icon: UserCheck },
  { href: '/blotter', label: 'Blotter', icon: BookOpen },
  { href: '/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/resident-requests', label: 'Resident Requests', icon: MessageSquare },
  { href: '/audit', label: 'Audit Logs', icon: ClipboardList },
  { href: '/users', label: 'User Accounts', icon: Shield, adminOnly: true },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth, hydrated, hydrate } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!hydrated) {
      hydrate()
    }
  }, [hydrated, hydrate])

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  // Don't render user-dependent content until hydrated
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-100 bg-gradient-to-r from-primary-600 to-primary-700">
            <h1 className="text-xl font-bold text-white">Barangay Information System</h1>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              if (item.adminOnly && user?.role !== 'ADMIN' && user?.role !== 'BARANGAY_CHAIRMAN') {
                return null
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="ml-2 h-2 w-2 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-3 mb-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-sm"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-lg">
          {/* Header */}
          <div className="flex items-center h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-primary-600 to-primary-700">
            <h1 className="text-lg font-bold text-white leading-tight">
              Barangay Information System
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              // Only show admin-only items to ADMIN or BARANGAY_CHAIRMAN users
              if (item.adminOnly && user?.role !== 'ADMIN' && user?.role !== 'BARANGAY_CHAIRMAN') {
                return null
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="ml-2 h-2 w-2 rounded-full bg-white animate-pulse" />
                  )}
                  {!isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 bg-primary-600 rounded-r-full transition-all duration-200 group-hover:h-8" />
                  )}
                </Link>
              )
            })}
          </nav>
          
          {/* User Section */}
          <div className="p-4 border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
            <div className="flex items-center space-x-3 mb-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="flex-shrink-0">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize mt-0.5">
                  {user?.role?.toLowerCase().replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-200 shadow-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-lg font-semibold text-primary-600">BIS</h1>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

