export type UserRole = 'admin' | 'partner'

export interface User {
  id: string
  name: string
  email: string
  company?: string
  role: UserRole
  pin?: string // Optional - only for partners
  status: 'active' | 'pending'
  createdAt: string
}

export interface Partner extends User {
  company: string
  role: 'partner'
}

export interface PriceList {
  id: string
  partnerId: string
  currency: 'USD' | 'INR' | 'EUR' | 'GBP'
  heliumLicenseMonthly: number
  heliumLicenseAnnual: number
  developmentRatePerHour: number
  deploymentCost: number
  maintenanceCost: number
  createdAt: string
  updatedAt: string
}

export interface Proposal {
  id: string
  partnerId: string
  title: string
  client: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  value: number
  currency: string
  timeline: string
  createdAt: string
  content?: ProposalContent
}

export interface ProposalContent {
  executiveSummary: string
  projectScope: string[]
  timeline: TimelinePhase[]
  investment: InvestmentItem[]
  deliverables: string[]
  technologyStack: {
    frontend: string
    backend: string
    infrastructure: string
  }
  termsAndConditions: string[]
}

export interface TimelinePhase {
  period: string
  title: string
  description: string
}

export interface InvestmentItem {
  name: string
  description: string
  amount: number
}

export interface DashboardStats {
  totalPartners: number
  activeProposals: number
  totalRevenue: number
  conversionRate: number
  partnersChange: number
  proposalsChange: number
  revenueChange: number
  conversionChange: number
}

