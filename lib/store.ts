import { create } from 'zustand'
import type { User, Partner, PriceList, Proposal } from '@/types'

interface AppState {
  currentUser: User | null
  partners: Partner[]
  priceLists: PriceList[]
  proposals: Proposal[]
  
  setCurrentUser: (user: User | null) => void
  addPartner: (partner: Partner) => void
  updatePartner: (id: string, partner: Partial<Partner>) => void
  deletePartner: (id: string) => void
  addPriceList: (priceList: PriceList) => void
  updatePriceList: (id: string, priceList: Partial<PriceList>) => void
  addProposal: (proposal: Proposal) => void
  updateProposal: (id: string, proposal: Partial<Proposal>) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  partners: [],
  priceLists: [],
  proposals: [],

  setCurrentUser: (user) => set({ currentUser: user }),
  
  addPartner: (partner) =>
    set((state) => ({ partners: [...state.partners, partner] })),
  
  updatePartner: (id, updates) =>
    set((state) => ({
      partners: state.partners.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  
  deletePartner: (id) =>
    set((state) => ({
      partners: state.partners.filter((p) => p.id !== id),
    })),
  
  addPriceList: (priceList) =>
    set((state) => ({ priceLists: [...state.priceLists, priceList] })),
  
  updatePriceList: (id, updates) =>
    set((state) => ({
      priceLists: state.priceLists.map((pl) =>
        pl.id === id ? { ...pl, ...updates } : pl
      ),
    })),
  
  addProposal: (proposal) =>
    set((state) => ({ proposals: [...state.proposals, proposal] })),
  
  updateProposal: (id, updates) =>
    set((state) => ({
      proposals: state.proposals.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  
  logout: () => set({ currentUser: null }),
}))

