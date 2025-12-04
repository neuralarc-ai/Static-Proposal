'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { getInitials } from '@/lib/utils'
import {
  RiDashboardLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiFileTextLine,
  RiSettingsLine,
  RiQuestionLine,
  RiLogoutBoxLine,
} from 'react-icons/ri'
import Image from 'next/image'

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
}

interface SidebarProps {
  role: 'admin' | 'partner'
}

export default function Sidebar({ role }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser, logout } = useAppStore()

  const handleNavClick = (href?: string, onClick?: () => void) => {
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    }
  }

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        // Call logout API to invalidate session
        await fetch('/api/auth/logout', {
          method: 'POST',
        })
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Clear local state and redirect to appropriate login
        logout()
        if (role === 'admin') {
          window.location.href = 'http://admin.localhost:3000/admin/login'
        } else {
          window.location.href = 'http://localhost:3000'
        }
      }
    }
  }

  const adminNavItems: NavItem[] = [
    {
      icon: RiDashboardLine,
      label: 'Dashboard',
      href: '/admin/dashboard',
      active: pathname === '/admin/dashboard',
    },
    {
      icon: RiUserLine,
      label: 'Partners',
      href: '/admin/partners',
      active: pathname === '/admin/partners',
    },
    {
      icon: RiMoneyDollarCircleLine,
      label: 'Price Lists',
      href: '/admin/pricing',
      active: pathname === '/admin/pricing',
    },
    {
      icon: RiFileTextLine,
      label: 'Proposals',
      href: '/admin/proposals',
      active: pathname === '/admin/proposals',
    },
  ]

  const partnerNavItems: NavItem[] = [
    {
      icon: RiDashboardLine,
      label: 'Dashboard',
      href: '/partner/dashboard',
      active: pathname === '/partner/dashboard',
    },
    {
      icon: RiFileTextLine,
      label: 'My Proposals',
      href: '/partner/proposals',
      active: pathname?.startsWith('/partner/proposals'),
    },
    {
      icon: RiMoneyDollarCircleLine,
      label: 'My Pricing',
      href: '/partner/pricing',
      active: pathname === '/partner/pricing',
    },
  ]

  const navItems = role === 'admin' ? adminNavItems : partnerNavItems

  return (
    <aside className="w-[280px] bg-white border-r border-gray-200 p-6 flex flex-col">
      <div className="mb-8">
        <Image
          src="/Neural-light-logo.png"
          alt="Neural Arc Logo"
          width={160}
          height={40}
          className="mb-6"
        />

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
            {currentUser ? getInitials(currentUser.name) : 'U'}
          </div>
          <div>
            <h4 className="text-base font-semibold m-0">
              {currentUser?.name || 'User'}
            </h4>
            <p className="text-sm text-gray-600 m-0">
              {role === 'admin' ? 'Administrator' : currentUser?.company || 'Partner'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1">
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Main
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href, item.onClick)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                  item.active
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>

        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            {role === 'admin' ? 'Settings' : 'Support'}
          </div>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-700 hover:bg-gray-100 transition-all"
          >
            <RiSettingsLine className="w-5 h-5" />
            <span className="font-medium">
              {role === 'admin' ? 'Settings' : 'Help & Support'}
            </span>
          </button>
          {role === 'admin' && (
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-700 hover:bg-gray-100 transition-all"
            >
              <RiQuestionLine className="w-5 h-5" />
              <span className="font-medium">Help & Support</span>
            </button>
          )}
        </div>
      </nav>

      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
        >
          <RiLogoutBoxLine className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

