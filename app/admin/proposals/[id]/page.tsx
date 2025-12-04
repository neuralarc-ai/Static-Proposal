'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import { RiArrowLeftLine, RiDownloadLine, RiCheckLine, RiCloseLine, RiCodeLine, RiThunderstormsLine, RiRocketLine, RiToolsLine, RiArchiveLine, RiSmartphoneLine, RiShieldCheckLine, RiBookOpenLine, RiCustomerServiceLine } from 'react-icons/ri'
import { formatCurrency, formatDate } from '@/lib/utils'
import Image from 'next/image'
import type { ProposalContent } from '@/types'

interface Proposal {
  id: string
  title: string
  client: string
  client_name?: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  value: number
  currency: string
  timeline: string
  executive_summary?: string
  executiveSummary?: string
  project_scope?: ProposalContent['projectScope']
  projectScope?: ProposalContent['projectScope']
  timeline_phases?: ProposalContent['timeline']
  timelinePhases?: ProposalContent['timeline']
  investment_items?: ProposalContent['investment']
  investment?: ProposalContent['investment']
  deliverables?: ProposalContent['deliverables']
  technology_stack?: ProposalContent['technologyStack']
  technologyStack?: ProposalContent['technologyStack']
  terms_and_conditions?: ProposalContent['termsAndConditions']
  termsAndConditions?: ProposalContent['termsAndConditions']
  created_at?: string
  createdAt?: string
  content?: ProposalContent
  users?: {
    id: string
    name: string
    email: string
    company: string | null
  }
}

export default function AdminProposalViewPage() {
  const params = useParams()
  const router = useRouter()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchProposal(params.id as string)
    }
  }, [params.id])

  const fetchProposal = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/proposals/${id}`)
      const data = await response.json()

      if (data.success) {
        // Transform API response to match our interface
        const apiProposal = data.proposal
        const transformedProposal: Proposal = {
          id: apiProposal.id,
          title: apiProposal.title,
          client: apiProposal.client || apiProposal.client_name,
          client_name: apiProposal.client || apiProposal.client_name,
          status: apiProposal.status,
          value: apiProposal.value,
          currency: apiProposal.currency,
          timeline: apiProposal.timeline,
          executive_summary: apiProposal.content?.executiveSummary || apiProposal.executive_summary || '',
          executiveSummary: apiProposal.content?.executiveSummary || apiProposal.executive_summary || '',
          project_scope: apiProposal.content?.projectScope || apiProposal.project_scope || [],
          projectScope: apiProposal.content?.projectScope || apiProposal.project_scope || [],
          timeline_phases: apiProposal.content?.timeline || apiProposal.timeline_phases || [],
          timelinePhases: apiProposal.content?.timeline || apiProposal.timeline_phases || [],
          investment_items: apiProposal.content?.investment || apiProposal.investment_items || [],
          investment: apiProposal.content?.investment || apiProposal.investment_items || [],
          deliverables: apiProposal.content?.deliverables || apiProposal.deliverables || [],
          technology_stack: apiProposal.content?.technologyStack || apiProposal.technology_stack,
          technologyStack: apiProposal.content?.technologyStack || apiProposal.technology_stack,
          terms_and_conditions: apiProposal.content?.termsAndConditions || apiProposal.terms_and_conditions || [],
          termsAndConditions: apiProposal.content?.termsAndConditions || apiProposal.terms_and_conditions || [],
          created_at: apiProposal.createdAt || apiProposal.created_at,
          createdAt: apiProposal.createdAt || apiProposal.created_at,
          users: apiProposal.partner || apiProposal.users,
        }
        setProposal(transformedProposal)
      } else {
        setError(data.error || 'Proposal not found')
      }
    } catch (err) {
      console.error('Error fetching proposal:', err)
      setError('Failed to load proposal')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    window.print()
  }

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (!proposal) return

    setUpdatingStatus(true)
    setError(null)

    try {
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchProposal(proposal.id)
        alert(`Proposal ${newStatus} successfully!`)
      } else {
        setError(data.error || 'Failed to update proposal status')
      }
    } catch (err) {
      console.error('Error updating proposal status:', err)
      setError('Failed to update proposal status. Please try again.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading proposal...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !proposal) {
    return (
      <DashboardLayout role="admin">
        <div className="text-center py-12">
          <p className="text-accent mb-4">{error || 'Proposal not found.'}</p>
          <Button onClick={() => router.push('/admin/proposals')}>
            <RiArrowLeftLine className="w-5 h-5" />
            Back to Proposals
          </Button>
        </div>
      </DashboardLayout>
    )
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

  const investmentItems = proposal.investment_items || proposal.investment || []
  const subtotal = investmentItems.reduce((sum, item) => sum + item.amount, 0)
  const tax = 0
  const total = subtotal + tax

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/admin/proposals')} className="mb-4">
          <RiArrowLeftLine className="w-5 h-5" />
          Back to Proposals
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-secondary font-bold mb-2">{proposal.title}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>
                <strong>Partner:</strong> {proposal.users?.name || 'Unknown'} - {proposal.users?.company || 'N/A'}
              </span>
              <span>•</span>
              <span>
                <strong>Client:</strong> {proposal.client_name || proposal.client}
              </span>
              <span>•</span>
              <span>
                <strong>Created:</strong> {formatDate(proposal.created_at || proposal.createdAt || '')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getStatusVariant(proposal.status)}>{proposal.status}</Badge>
            <Button onClick={handleExportPDF}>
              <RiDownloadLine className="w-5 h-5" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {proposal.status === 'draft' || proposal.status === 'pending' ? (
        <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Review Proposal</h3>
              <p className="text-sm text-gray-600">Approve or reject this proposal</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => handleStatusUpdate('approved')}
                disabled={updatingStatus}
                className="text-green-700 hover:bg-green-100"
              >
                <RiCheckLine className="w-5 h-5" />
                Approve
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleStatusUpdate('rejected')}
                disabled={updatingStatus}
                className="text-red-700 hover:bg-red-100"
              >
                <RiCloseLine className="w-5 h-5" />
                Reject
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="space-y-6 print:space-y-4">
        {/* Header */}
        <Card className="print:border-0 print:shadow-none">
          <div className="text-center mb-8">
            <Image
              src="/Neural-light-logo.png"
              alt="Neural Arc Logo"
              width={200}
              height={50}
              className="h-12 mx-auto mb-4"
            />
            <h2 className="text-4xl font-secondary font-bold mb-2">{proposal.title}</h2>
            <p className="text-xl text-gray-600">Prepared for {proposal.client_name || proposal.client}</p>
            <p className="text-sm text-gray-500 mt-2">Date: {formatDate(proposal.created_at || proposal.createdAt || '')}</p>
          </div>
        </Card>

        {/* Executive Summary */}
        <Card className="print:border-0 print:shadow-none">
          <h3 className="text-2xl font-secondary font-bold mb-4">Executive Summary</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {proposal.executive_summary || proposal.executiveSummary || ''}
            </p>
          </div>
        </Card>

        {/* Project Scope */}
        <Card className="print:border-0 print:shadow-none">
          <h3 className="text-2xl font-secondary font-bold mb-4">Project Scope</h3>
          <ul className="space-y-3">
            {(proposal.project_scope || proposal.projectScope || []).map((scope, index) => {
              const scopeObj = typeof scope === 'object' ? scope : { title: scope, description: '' }
              return (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <div>
                    <strong className="text-gray-900">{scopeObj.title || scope}</strong>
                    {scopeObj.description && (
                      <p className="text-gray-600 mt-1">{scopeObj.description}</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        {/* Timeline */}
        <Card className="print:border-0 print:shadow-none">
          <h3 className="text-2xl font-secondary font-bold mb-4">Project Timeline</h3>
          <div className="space-y-4">
            {(proposal.timeline_phases || proposal.timelinePhases || []).map((phase, index) => {
              const phaseObj = typeof phase === 'object' ? phase : { period: '', title: phase, description: '' }
              return (
                <div key={index} className="border-l-4 border-primary pl-4 pb-4 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary font-bold">Phase {index + 1}</span>
                    {phaseObj.period && (
                      <span className="text-sm text-gray-600">({phaseObj.period})</span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900">{phaseObj.title || phaseObj.period}</h4>
                  {phaseObj.description && (
                    <p className="text-gray-600 mt-1">{phaseObj.description}</p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Investment */}
        <Card className="print:border-0 print:shadow-none">
          <h3 className="text-2xl font-secondary font-bold mb-4">Investment Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                    Item
                  </th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                    Description
                  </th>
                  <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {(proposal.investment_items || proposal.investment || []).map((item, index) => (
                  <tr key={index}>
                    <td className="p-4 border-b border-gray-200 font-semibold">{item.name}</td>
                    <td className="p-4 border-b border-gray-200 text-gray-600">{item.description}</td>
                    <td className="p-4 border-b border-gray-200 text-right font-semibold">
                      {formatCurrency(item.amount, proposal.currency)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} className="p-4 text-right font-semibold">
                    Total
                  </td>
                  <td className="p-4 text-right font-bold text-xl">
                    {formatCurrency(total, proposal.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Deliverables */}
        <Card className="print:border-0 print:shadow-none">
          <h3 className="text-2xl font-secondary font-bold mb-4">Deliverables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(proposal.deliverables || []).map((deliverable, index) => {
              const iconMap: Record<string, typeof RiArchiveLine> = {
                RiArchiveLine,
                RiSmartphoneLine,
                RiShieldCheckLine,
                RiBookOpenLine,
                RiCustomerServiceLine,
                RiCodeLine,
                RiThunderstormsLine,
                RiRocketLine,
                RiToolsLine,
              }
              const deliverableObj = typeof deliverable === 'object' ? deliverable : { icon: 'RiArchiveLine', title: deliverable, description: '' }
              const Icon = deliverableObj.icon ? iconMap[deliverableObj.icon] || RiArchiveLine : RiArchiveLine
              const title = deliverableObj.title || deliverable
              const description = deliverableObj.description || ''

              return (
                <div key={index} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                  <Icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                    {description && <p className="text-sm text-gray-600">{description}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Technology Stack */}
        <Card className="print:border-0 print:shadow-none">
          <h3 className="text-2xl font-secondary font-bold mb-4">Technology Stack</h3>
          {(proposal.technology_stack || proposal.technologyStack) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Frontend</h4>
                <p className="text-gray-600">
                  {(proposal.technology_stack || proposal.technologyStack)?.frontend || 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Backend</h4>
                <p className="text-gray-600">
                  {(proposal.technology_stack || proposal.technologyStack)?.backend || 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Infrastructure</h4>
                <p className="text-gray-600">
                  {(proposal.technology_stack || proposal.technologyStack)?.infrastructure || 'Not specified'}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Terms and Conditions */}
        <Card className="print:border-0 print:shadow-none">
          <h3 className="text-2xl font-secondary font-bold mb-4">Terms and Conditions</h3>
          <ul className="space-y-2">
            {(proposal.terms_and_conditions || proposal.termsAndConditions || []).map((term, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">{term}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}

