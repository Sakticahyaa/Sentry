import type { Branch } from '../types/task'

export const BRANCHES: Branch[] = ['Meroket', 'Thesis', 'Yutaka', 'Roetix', 'Batin', 'Hyke']

export const BRANCH_COLORS: Record<Branch, string> = {
  Meroket: '#E74C3C',
  Thesis: '#F1C40F',
  Yutaka: '#1ABC9C',
  Roetix: '#8E44AD',
  Batin: '#1ABC9C',
  Hyke: '#3498DB',
}

export const BRANCH_BG: Record<Branch, string> = {
  Meroket: 'bg-red-500/20 text-red-400 border-red-500/30',
  Thesis: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Yutaka: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  Roetix: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Batin: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  Hyke: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}
