'use client'

import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from './sidebar'
import type { User } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'admin' | 'partner'
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { currentUser, setCurrentUser } = useAppStore()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check if we have a user in store
        if (currentUser && currentUser.role === role) {
          // Verify token is still valid by calling /api/auth/me
          const response = await fetch('/api/auth/me')
          const data = await response.json()

          if (response.ok && data.success) {
            // Token is valid, update user if needed
            const user: User = {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              company: data.user.company,
              role: data.user.role,
              status: data.user.status,
              createdAt: data.user.createdAt,
            }
            setCurrentUser(user)
            setLoading(false)
            return
          }
        }

        // No user or invalid token - check API
        const response = await fetch('/api/auth/me')
        const data = await response.json()

        if (response.ok && data.success) {
          const user: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            company: data.user.company,
            role: data.user.role,
            status: data.user.status,
            createdAt: data.user.createdAt,
          }

          // Check role matches
          if (user.role !== role) {
            // Redirect to correct subdomain
            if (user.role === 'admin') {
              window.location.href = 'http://admin.localhost:3000/admin/dashboard'
              return
            } else {
              window.location.href = 'http://localhost:3000/partner/dashboard'
              return
            }
          }

          setCurrentUser(user)
          setLoading(false)
        } else {
          // Not authenticated, redirect to appropriate login page
          if (role === 'admin') {
            window.location.href = 'http://admin.localhost:3000/admin/login'
          } else {
            window.location.href = 'http://localhost:3000'
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // Redirect based on role
        if (role === 'admin') {
          window.location.href = 'http://admin.localhost:3000/admin/login'
        } else {
          window.location.href = 'http://localhost:3000'
        }
      }
    }

    checkAuth()
  }, [currentUser, role, router, setCurrentUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser || currentUser.role !== role) {
    return null
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar role={role} />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}

