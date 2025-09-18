"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback} from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Loader2, LogOut, User, Mail, Calendar, Shield, CheckCircle } from 'lucide-react'

interface User {
  id: string
  email: string
  email_verified: boolean
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    console.log('Dashboard component mounted, fetching user data')
    fetchUser()
  }, [])

  const fetchUser = async () => {
    console.log('Fetching user data from /api/auth/me')
    try {
      const response = await fetch('/api/auth/me')
      console.log('User fetch response status:', response.status)
      const result = await response.json()
      console.log('User fetch result:', result)

      if (!response.ok) {
        console.log('User fetch failed, redirecting to login')
        router.push('/login')
        return
      }

      console.log('User data loaded successfully:', result.user)
      setUser(result.user)
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive',
      })
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        toast({
          title: 'Logged out',
          description: 'You have been successfully logged out',
        })
        router.push('/login')
      } else {
        throw new Error('Logout failed')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              {isLoggingOut ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Logging out...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-20 w-20 border-4 border-blue-100">
                <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">
                  {getInitials(user.email)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back!
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                {user.email}
              </p>
            </div>
          </div>

          {/* Account Information Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Account Status Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base font-medium">Account Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-medium text-green-600 capitalize">
                      {user.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Verified</span>
                    <span className="text-sm font-medium text-green-600">
                      {user.email_verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base font-medium">Email Address</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-900 break-all">
                  {user.email}
                </p>
              </CardContent>
            </Card>

            {/* Account Created Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-base font-medium">Member Since</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-900">
                  {formatDate(user.createdAt)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-12 justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
                <Button variant="outline" className="h-12 justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                <Button variant="outline" className="h-12 justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-xs text-gray-600">
                      Your account was successfully created and verified on {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Verified</p>
                    <p className="text-xs text-gray-600">
                      Your email address has been successfully verified
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}