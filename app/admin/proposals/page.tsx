'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Proposal {
  id: string
  title: string
  client_name: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  value: number
  currency: string
  timeline: string
  created_at: string
  users?: {
    id: string
    name: string
    email: string
    company: string | null
  }
}

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/proposals')
      const data = await response.json()

      if (data.success) {
        setProposals(data.proposals || [])
      }
    } catch (err) {
      console.error('Error fetching proposals:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success'
      case 'pending':
        return 'warning'
      case 'draft':
        return 'info'
      case 'rejected':
        return 'danger'
      default:
        return 'info'
    }
  }

  // Group proposals by partner
  const proposalsByPartner = proposals.reduce((acc, proposal) => {
    const partner = proposal.users
    const partnerName = partner 
      ? `${partner.name} - ${partner.company || 'No company'}` 
      : 'Unknown Partner'
    
    if (!acc[partnerName]) {
      acc[partnerName] = []
    }
    acc[partnerName].push(proposal)
    return acc
  }, {} as Record<string, Proposal[]>)

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading proposals...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-secondary font-bold mb-2">Proposals</h1>
        <p className="text-gray-600">View and manage all proposals</p>
      </div>

      {proposals.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600">No proposals yet.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(proposalsByPartner).map(([partnerName, partnerProposals]) => (
            <div key={partnerName}>
              <h2 className="text-xl font-secondary font-semibold mb-4">{partnerName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partnerProposals.map((proposal) => (
                  <Link key={proposal.id} href={`/admin/proposals/${proposal.id}`}>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold m-0 flex-1">{proposal.title}</h3>
                        <Badge variant={getStatusVariant(proposal.status)}>
                          {proposal.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Client:</span> {proposal.client_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Created:</span> {formatDate(proposal.created_at)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Timeline:</span> {proposal.timeline}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="text-2xl font-secondary font-bold">
                          {formatCurrency(proposal.value, proposal.currency)}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
