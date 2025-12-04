'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { RiArrowUpLine, RiArrowDownLine, RiUserAddLine, RiAddCircleLine, RiFileTextLine, RiDownloadLine, RiArrowRightLine } from 'react-icons/ri'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Stats {
  totalPartners: number
  activeProposals: number
  totalRevenue: number
  conversionRate: number
}

interface RecentPartner {
  id: string
  name: string
  email: string
  company: string | null
  created_at: string
}

interface RecentProposal {
  id: string
  title: string
  client_name: string
  status: string
  value: number
  currency: string
  created_at: string
  users?: {
    name: string
    company: string | null
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentPartners, setRecentPartners] = useState<RecentPartner[]>([])
  const [recentProposals, setRecentProposals] = useState<RecentProposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setRecentPartners(data.recentPartners || [])
        setRecentProposals(data.recentProposals || [])
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = stats ? [
    {
      label: 'Total Partners',
      value: stats.totalPartners.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      description: 'active partners',
    },
    {
      label: 'Active Proposals',
      value: stats.activeProposals.toString(),
      change: '+8%',
      changeType: 'positive' as const,
      description: 'draft & pending',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue, 'USD'),
      change: '+23%',
      changeType: 'positive' as const,
      description: 'from approved proposals',
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      change: '-3%',
      changeType: 'negative' as const,
      description: 'approval rate',
    },
  ] : []

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-secondary font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your partner portal performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm text-gray-600 m-0 mb-1">{stat.label}</p>
                <p className="text-3xl font-secondary font-bold m-0">{stat.value}</p>
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'positive' ? (
                  <RiArrowUpLine className="w-4 h-4" />
                ) : (
                  <RiArrowDownLine className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 m-0">{stat.description}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-secondary font-semibold m-0">Recent Partners</h3>
            <Link href="/admin/partners">
              <Button variant="ghost" size="sm">
                View All
                <RiArrowRightLine className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {recentPartners.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No partners yet</p>
          ) : (
            <div className="space-y-4">
              {recentPartners.map((partner) => (
                <div key={partner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold m-0">{partner.name}</p>
                    <p className="text-sm text-gray-600 m-0">{partner.company || 'No company'}</p>
                  </div>
                  <p className="text-xs text-gray-500 m-0">{formatDate(partner.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-secondary font-semibold m-0">Recent Proposals</h3>
            <Link href="/admin/proposals">
              <Button variant="ghost" size="sm">
                View All
                <RiArrowRightLine className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {recentProposals.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No proposals yet</p>
          ) : (
            <div className="space-y-4">
              {recentProposals.map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-semibold m-0">{proposal.title}</p>
                    <p className="text-sm text-gray-600 m-0">
                      {proposal.users?.name || 'Unknown'} • {proposal.client_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold m-0">{formatCurrency(proposal.value, proposal.currency)}</p>
                    <p className="text-xs text-gray-500 m-0">{formatDate(proposal.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-secondary font-semibold mb-6 m-0">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/partners">
            <Button className="w-full justify-start">
              <RiUserAddLine className="w-5 h-5" />
              Add Partner
            </Button>
          </Link>
          <Link href="/admin/pricing">
            <Button className="w-full justify-start">
              <RiAddCircleLine className="w-5 h-5" />
              Create Price List
            </Button>
          </Link>
          <Link href="/admin/proposals">
            <Button className="w-full justify-start">
              <RiFileTextLine className="w-5 h-5" />
              View Proposals
            </Button>
          </Link>
        </div>
      </Card>
    </DashboardLayout>
  )
}
