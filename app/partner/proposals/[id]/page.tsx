'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import Card from '@/components/ui/card'
import { RiArrowLeftLine, RiMessageLine, RiDownloadLine, RiSendPlaneLine, RiCheckLine, RiCodeLine, RiThunderstormsLine, RiRocketLine, RiToolsLine, RiArchiveLine, RiSmartphoneLine, RiShieldCheckLine, RiBookOpenLine, RiCustomerServiceLine } from 'react-icons/ri'
import { formatCurrency, formatDate } from '@/lib/utils'
import Image from 'next/image'
import type { ProposalContent } from '@/types'

interface Proposal {
  id: string
  title: string
  client: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  value: number
  currency: string
  timeline: string
  content: ProposalContent
  createdAt: string
}

export default function ProposalViewPage() {
  const params = useParams()
  const router = useRouter()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')
  const [sendingRequest, setSendingRequest] = useState(false)
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
        setProposal(data.proposal)
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

  const handleRequestInfo = () => {
    setIsInfoModalOpen(true)
  }

  const handleSendInfoRequest = async () => {
    if (!infoMessage.trim()) {
      setError('Please enter your question.')
      return
    }

    if (!proposal) return

    setSendingRequest(true)
    setError(null)

    try {
      const response = await fetch(`/api/proposals/${proposal.id}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: infoMessage.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsInfoModalOpen(false)
        setInfoMessage('')
        alert('Your request has been sent to the admin team. They will respond via email shortly.')
      } else {
        setError(data.error || 'Failed to send request')
      }
    } catch (err) {
      console.error('Error sending request:', err)
      setError('Failed to send request. Please try again.')
    } finally {
      setSendingRequest(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="partner">
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
      <DashboardLayout role="partner">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">{error || 'Proposal not found.'}</p>
          <Button onClick={() => router.push('/partner/dashboard')}>
            <RiArrowLeftLine className="w-5 h-5" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const subtotal = proposal.content.investment.reduce((sum, item) => sum + item.amount, 0)
  const tax = 0
  const total = subtotal + tax

  return (
    <DashboardLayout role="partner">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="secondary" onClick={() => router.back()}>
            <RiArrowLeftLine className="w-5 h-5" />
            Back
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRequestInfo}>
              <RiMessageLine className="w-5 h-5" />
              Request More Info
            </Button>
            <Button onClick={handleExportPDF}>
              <RiDownloadLine className="w-5 h-5" />
              Export as PDF
            </Button>
          </div>
        </div>

        <Card className="proposal-document">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-8 border-b-2 border-gray-200">
            <div>
              <Image
                src="/Neural-light-logo.png"
                alt="Neural Arc Logo"
                width={192}
                height={48}
              />
            </div>
            <div className="text-right">
              <p className="m-0 font-semibold">Proposal Date</p>
              <p className="m-0 text-gray-600">{formatDate(proposal.createdAt)}</p>
              <p className="m-0 mt-2 font-semibold">Proposal ID</p>
              <p className="m-0 text-gray-600">PROP-{proposal.id.slice(-6).toUpperCase()}</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-secondary font-bold mb-8">{proposal.title}</h1>

          {/* Executive Summary */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Executive Summary</h2>
            <p className="text-gray-700 whitespace-pre-line">{proposal.content.executiveSummary}</p>
          </section>

          {/* Project Scope */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Project Scope</h2>
            <div className="space-y-2">
              {proposal.content.projectScope.map((scope, idx) => (
                <div key={idx} className="flex gap-3">
                  <RiCheckLine className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="m-0 text-gray-700">{scope}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Project Timeline</h2>
            <div className="space-y-4">
              {proposal.content.timeline.map((phase, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-32 flex-shrink-0">
                    <strong>{phase.period}</strong>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{phase.title}</h3>
                    <p className="text-gray-600 text-sm m-0">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Investment Breakdown */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Investment Breakdown</h2>
            <div className="space-y-4">
              {proposal.content.investment.map((item, idx) => (
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
              {proposal.content.deliverables.map((deliverable, idx) => (
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
                <p className="text-gray-600 text-sm m-0">{proposal.content.technologyStack.frontend}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Backend</h3>
                <p className="text-gray-600 text-sm m-0">{proposal.content.technologyStack.backend}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Infrastructure</h3>
                <p className="text-gray-600 text-sm m-0">{proposal.content.technologyStack.infrastructure}</p>
              </div>
            </div>
          </section>

          {/* Terms and Conditions */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Terms and Conditions</h2>
            <div className="space-y-2">
              {proposal.content.termsAndConditions.map((term, idx) => (
                <div key={idx} className="flex gap-3">
                  <RiCheckLine className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
                  <p className="m-0 text-gray-700">{term}</p>
                </div>
              ))}
            </div>
          </section>
        </Card>
      </div>

      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false)
          setError(null)
        }}
        title="Request More Information"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsInfoModalOpen(false)
                setError(null)
              }}
              disabled={sendingRequest}
            >
              Cancel
            </Button>
            <Button onClick={handleSendInfoRequest} disabled={sendingRequest}>
              {sendingRequest ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <RiSendPlaneLine className="w-4 h-4" />
                  Send Request
                </>
              )}
            </Button>
          </>
        }
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <p className="text-gray-600">
            Have questions about this proposal? Send a message to the admin team, and they&apos;ll respond via email.
          </p>
          <div>
            <label className="block text-sm font-semibold mb-2">Your Question</label>
            <textarea
              value={infoMessage}
              onChange={(e) => {
                setInfoMessage(e.target.value)
                setError(null)
              }}
              rows={6}
              placeholder="Enter your question or request for more information..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
