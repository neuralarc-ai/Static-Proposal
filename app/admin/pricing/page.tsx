'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { RiAddCircleLine, RiEditLine, RiCodeLine, RiThunderstormsLine, RiRocketLine, RiToolsLine, RiDeleteBinLine } from 'react-icons/ri'
import { formatCurrency } from '@/lib/utils'

interface PriceList {
  id: string
  currency: 'USD' | 'INR' | 'EUR' | 'GBP'
  helium_license_monthly: number
  helium_license_annual: number
  development_rate_per_hour: number
  deployment_cost: number
  maintenance_cost: number
  created_at: string
  updated_at: string
}

export default function AdminPricingPage() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const pricingRes = await fetch('/api/pricing')
      const pricingData = await pricingRes.json()

      if (pricingData.success) {
        setPriceLists(pricingData.priceLists)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPriceList = () => {
    setEditingPriceList(null)
    setError(null)
    setIsModalOpen(true)
  }

  const handleEditPriceList = (priceList: PriceList) => {
    setEditingPriceList(priceList)
    setError(null)
    setIsModalOpen(true)
  }

  const handleDeletePriceList = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price list?')) {
      return
    }

    try {
      const response = await fetch(`/api/pricing/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setPriceLists(priceLists.filter((pl) => pl.id !== id))
      } else {
        alert(data.error || 'Failed to delete price list')
      }
    } catch (err) {
      console.error('Error deleting price list:', err)
      alert('Failed to delete price list')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const priceListData = {
      currency: formData.get('currency') as 'USD' | 'INR' | 'EUR' | 'GBP',
      helium_license_monthly: parseFloat(formData.get('heliumLicenseMonthly') as string),
      helium_license_annual: parseFloat(formData.get('heliumLicenseAnnual') as string),
      development_rate_per_hour: parseFloat(formData.get('developmentRatePerHour') as string),
      deployment_cost: parseFloat(formData.get('deploymentCost') as string),
      maintenance_cost: parseFloat(formData.get('maintenanceCost') as string),
    }

    try {
      let response
      if (editingPriceList) {
        // Update price list
        response = await fetch(`/api/pricing/${editingPriceList.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(priceListData),
        })
      } else {
        // Create price list
        response = await fetch('/api/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(priceListData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || `Failed to save price list (${response.status})`)
        return
      }

      const data = await response.json()

      if (data.success) {
        setIsModalOpen(false)
        setEditingPriceList(null)
        setError(null)
        e.currentTarget.reset()
        fetchData() // Refresh list
      } else {
        setError(data.error || 'Failed to save price list')
      }
    } catch (err) {
      console.error('Error saving price list:', err)
      setError('Failed to save price list')
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
            <p className="text-gray-600">Loading price lists...</p>
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
            <h1 className="text-3xl font-secondary font-bold mb-2">Price Lists</h1>
            <p className="text-gray-600">Manage personalized pricing for each partner</p>
          </div>
          <Button onClick={handleAddPriceList}>
            <RiAddCircleLine className="w-5 h-5" />
            Create Price List
          </Button>
        </div>
      </div>

      {error && !isModalOpen && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {priceLists.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 mb-4">No global pricing configured yet. Add pricing for currencies to get started.</p>
            <Button onClick={handleAddPriceList}>
              <RiAddCircleLine className="w-5 h-5" />
              Add Currency Pricing
            </Button>
          </Card>
        ) : (
          priceLists.map((priceList) => {
            return (
              <Card key={priceList.id}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-secondary font-semibold m-0">
                      Global Pricing - {priceList.currency}
                    </h3>
                    <p className="text-sm text-gray-600 m-0">
                      Applies to all partners automatically
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditPriceList(priceList)}>
                      <RiEditLine className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePriceList(priceList.id)}
                      className="text-accent hover:text-accent hover:bg-accent/10"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>

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
                      <tr>
                        <td className="p-4 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <RiThunderstormsLine className="w-4 h-4" />
                            <strong>Helium License (Monthly)</strong>
                          </div>
                        </td>
                        <td className="p-4 border-b border-gray-200">Monthly subscription</td>
                        <td className="p-4 border-b border-gray-200 text-right">
                          {formatCurrency(priceList.helium_license_monthly, priceList.currency)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <RiThunderstormsLine className="w-4 h-4" />
                            <strong>Helium License (Annual)</strong>
                          </div>
                        </td>
                        <td className="p-4 border-b border-gray-200">Annual subscription</td>
                        <td className="p-4 border-b border-gray-200 text-right">
                          {formatCurrency(priceList.helium_license_annual, priceList.currency)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <RiCodeLine className="w-4 h-4" />
                            <strong>Development Rate</strong>
                          </div>
                        </td>
                        <td className="p-4 border-b border-gray-200">Per hour</td>
                        <td className="p-4 border-b border-gray-200 text-right">
                          {formatCurrency(priceList.development_rate_per_hour, priceList.currency)}/hr
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <RiRocketLine className="w-4 h-4" />
                            <strong>Deployment Cost</strong>
                          </div>
                        </td>
                        <td className="p-4 border-b border-gray-200">One-time setup</td>
                        <td className="p-4 border-b border-gray-200 text-right">
                          {formatCurrency(priceList.deployment_cost, priceList.currency)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <RiToolsLine className="w-4 h-4" />
                            <strong>Maintenance Cost</strong>
                          </div>
                        </td>
                        <td className="p-4">Monthly</td>
                        <td className="p-4 text-right">
                          {formatCurrency(priceList.maintenance_cost, priceList.currency)}/mo
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            )
          })
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingPriceList(null)
          setError(null)
        }}
        title={editingPriceList ? 'Edit Price List' : 'Create Price List'}
        size="lg"
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
            <Button type="submit" form="price-list-form" disabled={submitting}>
              {submitting ? 'Saving...' : editingPriceList ? 'Update' : 'Create'} Price List
            </Button>
          </>
        }
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}
        <form id="price-list-form" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Currency *</label>
            <select
              name="currency"
              required
              defaultValue={editingPriceList?.currency || 'USD'}
              disabled={!!editingPriceList}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all disabled:bg-gray-100"
            >
              <option value="USD">USD - United States Dollar</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
            <p className="text-sm text-gray-600 mt-1">
              Global pricing for this currency. All partners will use this pricing automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Helium License (Monthly)</label>
              <input
                type="number"
                name="heliumLicenseMonthly"
                required
                step="0.01"
                defaultValue={editingPriceList?.helium_license_monthly}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Helium License (Annual)</label>
              <input
                type="number"
                name="heliumLicenseAnnual"
                required
                step="0.01"
                defaultValue={editingPriceList?.helium_license_annual}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Development Rate (Per Hour)</label>
              <input
                type="number"
                name="developmentRatePerHour"
                required
                step="0.01"
                defaultValue={editingPriceList?.development_rate_per_hour}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Deployment Cost (One-time)</label>
              <input
                type="number"
                name="deploymentCost"
                required
                step="0.01"
                defaultValue={editingPriceList?.deployment_cost}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Maintenance Cost (Monthly)</label>
              <input
                type="number"
                name="maintenanceCost"
                required
                step="0.01"
                defaultValue={editingPriceList?.maintenance_cost}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
