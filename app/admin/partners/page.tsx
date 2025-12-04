'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import Badge from '@/components/ui/badge'
import { RiUserAddLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import { getInitials } from '@/lib/utils'

interface Partner {
  id: string
  name: string
  email: string
  company: string | null
  role: 'partner'
  status: 'active' | 'pending' | 'suspended'
  created_at: string
  last_login_at: string | null
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch partners
  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/partners')
      const data = await response.json()

      if (data.success) {
        setPartners(data.partners)
      } else {
        setError(data.error || 'Failed to fetch partners')
      }
    } catch (err) {
      console.error('Error fetching partners:', err)
      setError('Failed to load partners')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPartner = () => {
    setEditingPartner(null)
    setError(null)
    setIsModalOpen(true)
  }

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner)
    setError(null)
    setIsModalOpen(true)
  }

  const handleDeletePartner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) {
      return
    }

    try {
      const response = await fetch(`/api/partners/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setPartners(partners.filter((p) => p.id !== id))
      } else {
        alert(data.error || 'Failed to delete partner')
      }
    } catch (err) {
      console.error('Error deleting partner:', err)
      alert('Failed to delete partner')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const partnerData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      pin: formData.get('pin') as string,
      status: (formData.get('status') as 'active' | 'pending' | 'suspended') || 'active',
    }

    try {
      let response
      if (editingPartner) {
        // Update partner
        response = await fetch(`/api/partners/${editingPartner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partnerData),
        })
      } else {
        // Create partner
        response = await fetch('/api/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partnerData),
        })
      }

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || `Failed to save partner${response.status ? ` (${response.status})` : ''}`)
        return
      }

      // Success
      setIsModalOpen(false)
      setEditingPartner(null)
      setError(null)
      e.currentTarget.reset()
      fetchPartners() // Refresh list
    } catch (err) {
      console.error('Error saving partner:', err)
      setError('Failed to save partner')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading partners...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-secondary font-bold mb-2">Partners</h1>
            <p className="text-gray-600">Manage your partner accounts</p>
          </div>
          <Button onClick={handleAddPartner}>
            <RiUserAddLine className="w-5 h-5" />
            Add Partner
          </Button>
        </div>
      </div>

      {error && !isModalOpen && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.length === 0 ? (
          <Card className="col-span-full text-center py-12">
            <p className="text-gray-600 mb-4">No partners yet. Add your first partner to get started.</p>
            <Button onClick={handleAddPartner}>
              <RiUserAddLine className="w-5 h-5" />
              Add Partner
            </Button>
          </Card>
        ) : (
          partners.map((partner) => (
            <Card key={partner.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {getInitials(partner.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold m-0">{partner.name}</h3>
                    <p className="text-sm text-gray-600 m-0">{partner.company || 'No company'}</p>
                  </div>
                </div>
                <Badge variant={partner.status === 'active' ? 'success' : partner.status === 'pending' ? 'warning' : 'danger'}>
                  {partner.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="text-gray-600">Email:</span>{' '}
                  <span className="font-medium">{partner.email}</span>
                </div>
                {partner.last_login_at && (
                  <div className="text-sm">
                    <span className="text-gray-600">Last login:</span>{' '}
                    <span className="font-medium">
                      {new Date(partner.last_login_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditPartner(partner)}
                  className="flex-1"
                >
                  <RiEditLine className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePartner(partner.id)}
                  className="flex-1 text-accent hover:text-accent hover:bg-accent/10"
                >
                  <RiDeleteBinLine className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingPartner(null)
          setError(null)
        }}
        title={editingPartner ? 'Edit Partner' : 'Add Partner'}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setError(null)
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" form="partner-form" disabled={submitting}>
              {submitting ? 'Saving...' : editingPartner ? 'Update' : 'Create'} Partner
            </Button>
          </>
        }
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}
        <form id="partner-form" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              required
              defaultValue={editingPartner?.name}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Company Name</label>
            <input
              type="text"
              name="company"
              required
              defaultValue={editingPartner?.company || ''}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              required
              defaultValue={editingPartner?.email}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">4-Digit PIN</label>
            <input
              type="text"
              name="pin"
              required={!editingPartner}
              pattern="[0-9]{4}"
              maxLength={4}
              defaultValue=""
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              placeholder="0000"
            />
            {editingPartner && (
              <p className="text-xs text-gray-500 mt-1">Leave empty to keep current PIN</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select
              name="status"
              defaultValue={editingPartner?.status || 'active'}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
