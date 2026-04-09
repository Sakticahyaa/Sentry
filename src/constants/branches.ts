import type { Branch } from '../types/task'

export const BRANCHES: Branch[] = ['Meroket', 'Thesis', 'Yutaka', 'Roetix', 'Batin', 'Hyke']

export const BRANCH_COLORS: Record<Branch, string> = {
  Meroket: '#E74C3C',
  Thesis:  '#C9A84C',
  Yutaka:  '#1ABC9C',
  Roetix:  '#8E44AD',
  Batin:   '#26A69A',
  Hyke:    '#5B6B8A',
}

export const BRANCH_BG: Record<Branch, string> = {
  Meroket: 'bg-red-100 text-red-700 border-red-200',
  Thesis:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  Yutaka:  'bg-teal-100 text-teal-700 border-teal-200',
  Roetix:  'bg-purple-100 text-purple-700 border-purple-200',
  Batin:   'bg-teal-100 text-teal-700 border-teal-200',
  Hyke:    'bg-blue-100 text-blue-700 border-blue-200',
}
