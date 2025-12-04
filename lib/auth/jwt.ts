/**
 * JWT Token Utilities
 * Handles token generation and verification
 */

import jwt from 'jsonwebtoken'
import type { UserRole } from '@/types'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-min-32-characters'
const JWT_EXPIRES_IN_ADMIN = process.env.JWT_EXPIRES_IN_ADMIN || '24h'
const JWT_EXPIRES_IN_PARTNER = process.env.JWT_EXPIRES_IN_PARTNER || '7d'

/**
 * Generate JWT token for a user
 */
export function generateToken(userId: string, email: string, role: UserRole): string {
  const expiresIn = role === 'admin' ? JWT_EXPIRES_IN_ADMIN : JWT_EXPIRES_IN_PARTNER

  const payload = {
    userId,
    email,
    role,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn,
  } as jwt.SignOptions)
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpiration(role: UserRole): number {
  const expiresIn = role === 'admin' ? JWT_EXPIRES_IN_ADMIN : JWT_EXPIRES_IN_PARTNER
  
  // Parse expiresIn string (e.g., "24h", "7d") to seconds
  const match = expiresIn.match(/^(\d+)([hdms])$/)
  if (!match) return 86400 // Default 24 hours

  const value = parseInt(match[1], 10)
  const unit = match[2]

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  }

  return value * (multipliers[unit] || 86400)
}

