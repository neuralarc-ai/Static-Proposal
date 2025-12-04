'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { RiUserLine, RiArrowRightLine } from 'react-icons/ri'
import { useAppStore } from '@/lib/store'
import type { User } from '@/types'

export default function PartnerLoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState<string[]>(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentUser } = useAppStore()

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setError(null)

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 4)
    
    const newPin = ['', '', '', '']
    digits.forEach((digit, i) => {
      newPin[i] = digit
    })
    setPin(newPin)
    setError(null)
    
    if (digits.length === 4) {
      const lastInput = document.getElementById(`pin-3`)
      lastInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pinString = pin.join('')
    
    if (pinString.length !== 4) {
      setError('Please enter a 4-digit PIN')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/partner/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pin: pinString,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Invalid PIN. Please try again.')
        setLoading(false)
        return
      }

      // Set user in store
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        company: data.user.company,
        role: data.user.role,
        pin: pinString,
        status: 'active',
        createdAt: new Date().toISOString(),
      }
      setCurrentUser(user)

      // Redirect to partner dashboard
      router.push('/partner/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border border-gray-200 rounded-3xl p-12 max-w-md w-full shadow-xl">
        <div className="text-center mb-12">
          <Image
            src="/Neural-light-logo.png"
            alt="Neural Arc Logo"
            width={192}
            height={48}
            className="h-12 mx-auto mb-8"
          />
          <h1 className="text-3xl font-secondary font-bold mb-2">Partner Portal</h1>
          <p className="text-gray-600">Enter your 4-digit PIN to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 justify-center mb-8">
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`pin-${index}`}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={loading}
                className="w-16 h-20 text-center text-3xl font-secondary font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                inputMode="numeric"
                pattern="[0-9]"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 px-6 rounded-xl font-semibold text-lg hover:bg-secondary hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Access Portal</span>
                <RiArrowRightLine className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            Admin?{' '}
            <a href="/admin/login" className="text-primary font-semibold hover:opacity-70">
              Admin Login
            </a>
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Need assistance?{' '}
            <a href="mailto:support@neuralarc.ai" className="text-primary font-semibold hover:opacity-70">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

