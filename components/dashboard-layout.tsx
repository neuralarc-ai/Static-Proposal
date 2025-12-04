'use client'

import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
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
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    // Prevent multiple calls - only run once per mount
    if (hasCheckedRef.current) return
    hasCheckedRef.current = true
    
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
            // Redirect to correct path
            if (user.role === 'admin') {
              window.location.href = '/admin/dashboard'
              return
            } else {
              window.location.href = '/partner/dashboard'
              return
            }
          }

          setCurrentUser(user)
          setLoading(false)
        } else {
          // Not authenticated, redirect to appropriate login page
          if (role === 'admin') {
            window.location.href = '/admin/login'
          } else {
            window.location.href = '/partner/login'
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // Redirect based on role
        if (role === 'admin') {
          const adminUrl = window.location.origin.includes('admin.')
            ? `${window.location.origin}/admin/login`
            : window.location.origin.replace('https://', 'https://admin.').replace('http://', 'http://admin.') + '/admin/login'
          window.location.href = adminUrl
        } else {
          const partnerUrl = window.location.origin.includes('admin.')
            ? window.location.origin.replace('admin.', '')
            : window.location.origin
          window.location.href = partnerUrl
        }
      }
    }

    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

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

