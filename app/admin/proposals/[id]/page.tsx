'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import { RiArrowLeftLine, RiDownloadLine, RiCheckLine, RiCloseLine, RiCodeLine, RiThunderstormsLine, RiRocketLine, RiToolsLine } from 'react-icons/ri'
import { formatCurrency, formatDate } from '@/lib/utils'
import Image from 'next/image'
import type { ProposalContent } from '@/types'
import { generateProposalPDF } from '@/lib/pdf/generator'

interface Proposal {
  id: string
  title: string
  client: string
  client_name?: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  value: number
  currency: string
  timeline: string
  content?: ProposalContent
  executiveSummary?: string
  executive_summary?: string
  projectScope?: ProposalContent['projectScope']
  project_scope?: ProposalContent['projectScope']
  timelinePhases?: ProposalContent['timeline']
  timeline_phases?: ProposalContent['timeline']
  investment?: ProposalContent['investment']
  investment_items?: ProposalContent['investment']
  deliverables?: ProposalContent['deliverables']
  technologyStack?: ProposalContent['technologyStack']
  technology_stack?: ProposalContent['technologyStack']
  termsAndConditions?: ProposalContent['termsAndConditions']
  terms_and_conditions?: ProposalContent['termsAndConditions']
  createdAt?: string
  created_at?: string
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
  const [exportingPDF, setExportingPDF] = useState(false)

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
        // Transform API response to match partner portal format
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
          content: apiProposal.content || {
            executiveSummary: apiProposal.executive_summary || '',
            projectScope: apiProposal.project_scope || [],
            timeline: apiProposal.timeline_phases || [],
            investment: apiProposal.investment_items || [],
            deliverables: apiProposal.deliverables || [],
            technologyStack: apiProposal.technology_stack || {
              frontend: '',
              backend: '',
              infrastructure: '',
            },
            termsAndConditions: apiProposal.terms_and_conditions || [],
          },
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

  const handleExportPDF = async () => {
    if (!proposal) return
    
    setExportingPDF(true)
    try {
      const proposalElement = document.getElementById('proposal-document')
      if (!proposalElement) {
        throw new Error('Proposal element not found')
      }

      const filename = `Proposal-${proposal.id.slice(-6).toUpperCase()}-${proposal.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.pdf`
      
      await generateProposalPDF({
        element: proposalElement,
        filename,
        title: proposal.title,
      })
    } catch (err) {
      console.error('Error exporting PDF:', err)
      setError('Failed to export PDF. Please try again.')
    } finally {
      setExportingPDF(false)
    }
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
        <div className="flex items-center justify-center min-h-[400px]">
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
          <p className="text-gray-600 mb-4">{error || 'Proposal not found.'}</p>
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

  const content = proposal.content || {
    executiveSummary: proposal.executiveSummary || proposal.executive_summary || '',
    projectScope: proposal.projectScope || proposal.project_scope || [],
    timeline: proposal.timelinePhases || proposal.timeline_phases || [],
    investment: proposal.investment || proposal.investment_items || [],
    deliverables: proposal.deliverables || [],
    technologyStack: proposal.technologyStack || proposal.technology_stack || {
      frontend: '',
      backend: '',
      infrastructure: '',
    },
    termsAndConditions: proposal.termsAndConditions || proposal.terms_and_conditions || [],
  }

  const subtotal = content.investment.reduce((sum, item) => sum + item.amount, 0)
  const tax = 0
  const total = subtotal + tax

  return (
    <DashboardLayout role="admin">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="secondary" onClick={() => router.back()}>
            <RiArrowLeftLine className="w-5 h-5" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Badge variant={getStatusVariant(proposal.status)}>{proposal.status}</Badge>
            <Button onClick={handleExportPDF} disabled={exportingPDF}>
              {exportingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <RiDownloadLine className="w-5 h-5" />
                  Export as PDF
                </>
              )}
            </Button>
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

        <Card id="proposal-document" className="proposal-document">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-8 border-b-2 border-gray-200">
            <div>
              <Image
                src="/Neural-light-logo.png"
                alt="Neural Arc Logo"
                width={192}
                height={48}
                style={{ width: 'auto', height: '48px', objectFit: 'contain' }}
              />
            </div>
            <div className="text-right">
              <p className="m-0 font-semibold">Proposal Date</p>
              <p className="m-0 text-gray-600">{formatDate(proposal.createdAt || proposal.created_at || '')}</p>
              <p className="m-0 mt-2 font-semibold">Proposal ID</p>
              <p className="m-0 text-gray-600">PROP-{proposal.id.slice(-6).toUpperCase()}</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-secondary font-bold mb-8">{proposal.title}</h1>

          {/* Executive Summary */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Executive Summary</h2>
            <p className="text-gray-700 whitespace-pre-line">{content.executiveSummary}</p>
          </section>

          {/* Project Scope */}
          <section className="mb-8">
            <h2 className="text-2xl font-secondary font-semibold mb-6 pb-2 border-b border-gray-200">Project Scope</h2>
            
            {/* Core Features */}
            <div className="mb-6">
              <h3 className="text-xl font-secondary font-semibold mb-4">Core Features</h3>
              <div className="space-y-3">
                {content.projectScope.map((scope, idx) => {
                  // Handle both string and object formats
                  const scopeText = typeof scope === 'string' ? scope : scope.title || scope
                  const scopeDesc = typeof scope === 'object' && scope.description ? scope.description : ''
                  
                  return (
                    <div key={idx} className="flex gap-3 items-start">
                      <RiCheckLine className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="m-0 font-semibold text-gray-900">{scopeText}</p>
                        {scopeDesc && (
                          <p className="m-0 text-gray-600 text-sm mt-1">{scopeDesc}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section className="mb-8">
            <h2 className="text-2xl font-secondary font-semibold mb-6 pb-2 border-b border-gray-200">Project Timeline</h2>
            <div className="space-y-6">
              {content.timeline.map((phase, idx) => (
                <div key={idx} className="border-l-4 border-primary pl-4 pb-4 last:pb-0">
                  <div className="mb-2">
                    <strong className="text-primary text-lg">{phase.period}</strong>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{phase.title}</h3>
                    <p className="text-gray-600 m-0 leading-relaxed">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Investment Breakdown */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Investment Breakdown</h2>
            <div className="space-y-4">
              {content.investment.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.name.includes('License') && <RiThunderstormsLine className="w-4 h-4" />}
                      {item.name.includes('Development') && <RiCodeLine className="w-4 h-4" />}
                      {item.name.includes('Deployment') && <RiRocketLine className="w-4 h-4" />}
                      {item.name.includes('Maintenance') && <RiToolsLine className="w-4 h-4" />}
                      <strong>{item.name}</strong>
                    </div>
                    <p className="text-gray-600 text-sm m-0">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold m-0">{formatCurrency(item.amount, proposal.currency)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal, proposal.currency)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-600">{formatCurrency(tax, proposal.currency)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-2xl font-bold">Total</span>
                <span className="text-2xl font-bold">{formatCurrency(total, proposal.currency)}</span>
              </div>
            </div>
          </section>

          {/* Deliverables */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Deliverables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.deliverables.map((deliverable, idx) => (
                <div key={idx} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  <RiCheckLine className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
                  <p className="m-0 text-gray-700">{deliverable}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Technology Stack */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Technology Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Frontend</h3>
                <p className="text-gray-600 text-sm m-0">{content.technologyStack.frontend}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Backend</h3>
                <p className="text-gray-600 text-sm m-0">{content.technologyStack.backend}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Infrastructure</h3>
                <p className="text-gray-600 text-sm m-0">{content.technologyStack.infrastructure}</p>
              </div>
            </div>
          </section>

          {/* Terms and Conditions */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Terms and Conditions</h2>
            <div className="space-y-2">
              {content.termsAndConditions.map((term, idx) => (
                <div key={idx} className="flex gap-3">
                  <RiCheckLine className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
                  <p className="m-0 text-gray-700">{term}</p>
                </div>
              ))}
            </div>
          </section>
        </Card>
      </div>
    </DashboardLayout>
  )
}
