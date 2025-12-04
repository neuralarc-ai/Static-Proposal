'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import Modal from '@/components/ui/modal'
import { RiSendPlaneLine, RiSparklingLine, RiEyeLine } from 'react-icons/ri'
import { useAppStore } from '@/lib/store'
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
}

export default function PartnerDashboardPage() {
  const router = useRouter()
  const { currentUser } = useAppStore()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Hello! I am here to help you create professional proposals. Tell me about your project requirements, and I will generate a comprehensive proposal with pricing based on your custom rate card.\n\nYou can include details like:\n• Project scope and objectives\n• Timeline and deliverables\n• Technology requirements\n• Team size and resources needed`,
    },
  ])
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [clientName, setClientName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [requirements, setRequirements] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch proposals
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const userMessage = message.trim()
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    
    // Extract requirements from message
    const lines = userMessage.split('\n').filter(line => line.trim())
    const newRequirements = lines.filter(line => 
      line.trim().startsWith('•') || 
      line.trim().startsWith('-') || 
      line.trim().startsWith('*')
    ).map(line => line.replace(/^[•\-\*]\s*/, '').trim())
    
    if (newRequirements.length > 0) {
      setRequirements((prev) => [...prev, ...newRequirements])
    }
    
    // Update project description
    if (!projectDescription) {
      setProjectDescription(userMessage)
    } else {
      setProjectDescription((prev) => prev + '\n\n' + userMessage)
    }

    setMessage('')

    // Simulate AI response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I understand your requirements. To generate a comprehensive proposal, I'll need:\n\n• Client/Company name\n• Project description (which you've provided)\n• Key requirements\n\nWould you like me to generate a detailed proposal document?`,
        },
      ])

      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'GENERATE_PROPOSAL_BUTTON',
          },
        ])
      }, 1000)
    }, 1500)
  }

  const handleGenerateProposal = () => {
    setShowGenerateModal(true)
  }

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim()) {
      setError('Client name is required')
      return
    }

    if (!projectDescription.trim()) {
      setError('Project description is required')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      // Extract requirements from project description if not already set
      const reqs = requirements.length > 0 
        ? requirements 
        : projectDescription.split('\n').filter(line => line.trim()).slice(0, 5)

      const response = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          projectDescription: projectDescription.trim(),
          requirements: reqs,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Reset form
        setClientName('')
        setProjectDescription('')
        setRequirements([])
        setChatMessages([
          {
            role: 'assistant',
            content: `Great! I've generated a proposal for ${data.proposal.client}. You can view and edit it now.`,
          },
        ])
        setShowGenerateModal(false)
        
        // Refresh proposals and navigate
        await fetchProposals()
        router.push(`/partner/proposals/${data.proposal.id}`)
      } else {
        setError(data.error || 'Failed to generate proposal')
      }
    } catch (err) {
      console.error('Error generating proposal:', err)
      setError('Failed to generate proposal. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <DashboardLayout role="partner">
      <div className="mb-8">
        <h1 className="text-3xl font-secondary font-bold mb-2">
          Welcome back, {currentUser?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">Create proposals and manage your client projects</p>
      </div>

      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-secondary font-semibold m-0">Create New Proposal</h3>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <RiSparklingLine className="w-4 h-4" />
            <span>AI-Powered Proposal Generation</span>
          </div>
        </div>

        <div className="flex flex-col h-[400px] border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {chatMessages.map((msg, idx) => {
              if (msg.content === 'GENERATE_PROPOSAL_BUTTON') {
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 text-primary flex items-center justify-center font-bold flex-shrink-0">
                      AI
                    </div>
                    <div className="flex-1">
                      <Button onClick={handleGenerateProposal}>
                        Generate Proposal
                      </Button>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={idx}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-primary'
                    }`}
                  >
                    {msg.role === 'user' ? 'P' : 'AI'}
                  </div>
                  <div
                    className={`max-w-[70%] p-4 rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-primary'
                    }`}
                  >
                    <p className="m-0 whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your project requirements..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />
              <Button type="submit">
                <RiSendPlaneLine className="w-5 h-5" />
                Send
              </Button>
            </form>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-secondary font-semibold m-0">Your Previous Proposals</h3>
          <Badge variant="info">{proposals.length} Total</Badge>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading proposals...</p>
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No proposals yet. Create your first proposal using the chat above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((proposal) => (
              <Link key={proposal.id} href={`/partner/proposals/${proposal.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold m-0 flex-1">{proposal.title}</h4>
                    <Badge variant={proposal.status === 'approved' ? 'success' : proposal.status === 'pending' ? 'warning' : 'info'}>
                      {proposal.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Created:</span> {formatDate(proposal.created_at)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Timeline:</span> {proposal.timeline}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Client:</span> {proposal.client_name}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-2xl font-secondary font-bold">
                      {formatCurrency(proposal.value, proposal.currency)}
                    </div>
                    <Button variant="ghost" size="sm">
                      <RiEyeLine className="w-4 h-4" />
                      View
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showGenerateModal}
        onClose={() => {
          setShowGenerateModal(false)
          setError(null)
        }}
        title="Generate Proposal"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowGenerateModal(false)
                setError(null)
              }}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button type="submit" form="proposal-form" disabled={generating}>
              {generating ? 'Generating...' : 'Generate Proposal'}
            </Button>
          </>
        }
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}
        <form id="proposal-form" onSubmit={handleSubmitProposal} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Client/Company Name *</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              placeholder="Enter client or company name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Project Description *</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              required
              rows={6}
              placeholder="Describe the project scope, objectives, and requirements..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be used to generate a comprehensive proposal with pricing, timeline, and deliverables.
            </p>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
