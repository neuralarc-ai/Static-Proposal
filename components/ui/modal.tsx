'use client'

import { useEffect } from 'react'
import { RiCloseLine } from 'react-icons/ri'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-6"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-white rounded-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl',
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-secondary font-bold m-0">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">{children}</div>

        {footer && (
          <div className="p-8 border-t border-gray-200 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

