import { useState, useEffect, createContext, useContext } from 'react'
import type { BranchRecord } from '../types/task'
import { fetchBranches, createBranch, deleteBranch, updateBranch } from '../lib/supabase'

export function useBranches(enabled = true) {
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enabled) return
    fetchBranches().then(data => { setBranches(data); setLoading(false) })
  }, [enabled])

  const addBranch = async (name: string, color: string) => {
    const created = await createBranch(name, color)
    setBranches(prev => [...prev, created])
  }

  const removeBranch = async (id: string, name: string) => {
    await deleteBranch(id, name)
    setBranches(prev => prev.filter(b => b.id !== id))
  }

  const editBranch = async (id: string, updates: Partial<Pick<BranchRecord, 'name' | 'color'>>) => {
    const updated = await updateBranch(id, updates)
    setBranches(prev => prev.map(b => b.id === id ? updated : b))
  }

  // Quick color lookup map
  const colorMap: Record<string, string> = {}
  for (const b of branches) colorMap[b.name] = b.color

  const getColor = (name: string | null) => name ? (colorMap[name] ?? '#cbd3d6') : '#cbd3d6'

  return { branches, loading, addBranch, removeBranch, editBranch, getColor }
}

// Context so components can access branch colors without prop drilling
export interface BranchesCtx {
  branches: BranchRecord[]
  getColor: (name: string | null) => string
}

export const BranchesContext = createContext<BranchesCtx>({
  branches: [],
  getColor: () => '#cbd3d6',
})

export const useBranchColor = (name: string | null) =>
  useContext(BranchesContext).getColor(name)

export const useBranchList = () =>
  useContext(BranchesContext).branches
