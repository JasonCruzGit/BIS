'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Phone, LogIn, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import portalApi from '@/lib/portal-api'

export default function PortalLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [usePassword, setUsePassword] = useState(true) // Default to password mode
  const [formData, setFormData] = useState({
    contactNo: '',
    password: '',
    dateOfBirth: '',
  })

  // Check localStorage for login mode preference
  useEffect(() => {
    const savedMode = localStorage.getItem('portal_login_mode')
    if (savedMode === 'dob') {
      setUsePassword(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      const loginData = {
        contactNo: formData.contactNo,
        ...(usePassword ? { password: formData.password } : { dateOfBirth: formData.dateOfBirth }),
      }

      const response = await fetch(`${apiUrl}/portal/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      // Debug logging
      console.log('Login response:', data)
      console.log('requiresPasswordSetup:', data.requiresPasswordSetup)

      if (!response.ok) {
        // If password is required but not provided, switch to password mode
        if (data.requiresPassword && !usePassword) {
          setUsePassword(true)
          toast.error('Please use your password to login')
          setLoading(false)
          return
        }
        // If date of birth is required, switch to date of birth mode
        if (data.message?.includes('Date of birth') || data.message?.includes('first-time')) {
          setUsePassword(false)
          localStorage.setItem('portal_login_mode', 'dob')
          toast.error(data.message || 'Please use your date of birth for first-time login')
          setLoading(false)
          return
        }
        throw new Error(data.message || 'Login failed')
      }

      // Store token and resident info
      localStorage.setItem('portal_token', data.token)
      localStorage.setItem('residentToken', data.token) // Also store as residentToken for compatibility
      localStorage.setItem('portal_resident', JSON.stringify(data.resident))
      localStorage.setItem('resident', JSON.stringify(data.resident)) // Also store as resident for compatibility

      // If password setup is required, show modal
      console.log('Checking requiresPasswordSetup:', data.requiresPasswordSetup)
      if (data.requiresPasswordSetup === true) {
        console.log('Showing password setup modal')
        setLoading(false)
        setShowPasswordSetup(true)
        return
      }

      // Save login mode preference
      if (usePassword) {
        localStorage.setItem('portal_login_mode', 'password')
      }

      toast.success('Login successful!')
      router.push('/portal/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [settingPassword, setSettingPassword] = useState(false)

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setSettingPassword(true)

    try {
      await portalApi.put('/password', {
        password: passwordData.password,
        confirmPassword: passwordData.confirmPassword,
      })

      toast.success('Password set successfully!')
      setShowPasswordSetup(false)
      // Update login mode preference
      localStorage.setItem('portal_login_mode', 'password')
      setUsePassword(true)
      router.push('/portal/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to set password')
    } finally {
      setSettingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resident Portal</h1>
          <p className="text-gray-600">Access your documents and services</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                required
                value={formData.contactNo}
                onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                placeholder="09XX XXX XXXX"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {usePassword ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                First time?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setUsePassword(false)
                    setFormData({ ...formData, password: '' })
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Use date of birth instead
                </button>
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Have a password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setUsePassword(true)
                    setFormData({ ...formData, dateOfBirth: '' })
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Use password instead
                </button>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact the barangay office.
          </p>
        </div>
      </div>

      {/* Password Setup Modal */}
      {showPasswordSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Password</h2>
              <p className="text-gray-600">
                For security, please set a password for your account. You'll use this password along with your contact number for future logins.
              </p>
            </div>

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    placeholder="Enter password (min. 6 characters)"
                    minLength={6}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    minLength={6}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSetup(false)
                    router.push('/portal/dashboard')
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={settingPassword}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {settingPassword ? 'Setting...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

