'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import Card from '@/components/ui/card'
import { RiCodeLine, RiThunderstormsLine, RiRocketLine, RiToolsLine } from 'react-icons/ri'
import { useAppStore } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'

interface PriceList {
  id: string
  currency: 'USD' | 'INR' | 'EUR' | 'GBP'
  helium_license_monthly: number
  helium_license_annual: number
  development_rate_per_hour: number
  deployment_cost: number
  maintenance_cost: number
}

export default function PartnerPricingPage() {
  const { currentUser } = useAppStore()
  const [priceList, setPriceList] = useState<PriceList | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPriceList()
  }, [])

  const fetchPriceList = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pricing')
      const data = await response.json()

      if (data.success && data.priceLists && data.priceLists.length > 0) {
        // Show the first available global price list (or filter by preferred currency)
        // For now, show the first one (typically USD or INR)
        setPriceList(data.priceLists[0])
      }
    } catch (err) {
      console.error('Error fetching price list:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="partner">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pricing...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!priceList) {
    return (
      <DashboardLayout role="partner">
        <div className="mb-8">
          <h1 className="text-3xl font-secondary font-bold mb-2">My Pricing</h1>
          <p className="text-gray-600">View your personalized pricing</p>
        </div>

        <Card className="text-center py-12">
          <p className="text-gray-600 mb-4">
            No pricing has been set up for your account yet. Please contact your administrator to set up your pricing.
          </p>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="partner">
      <div className="mb-8">
        <h1 className="text-3xl font-secondary font-bold mb-2">Pricing</h1>
        <p className="text-gray-600">Global pricing information (applies to all partners)</p>
      </div>

      <Card>
        <div className="mb-6">
          <h3 className="text-xl font-secondary font-semibold m-0">
            Global Pricing - {priceList.currency}
          </h3>
          <p className="text-sm text-gray-600 m-0 mt-1">
            This pricing applies automatically to all proposals
          </p>
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
    </DashboardLayout>
  )
}
