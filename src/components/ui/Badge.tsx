import type { Branch, Priority } from '../../types/task'
import { BRANCH_BG } from '../../constants/branches'
import { PRIORITY_CONFIG } from '../../constants/timeblocks'

export function BranchBadge({ branch }: { branch: Branch | null }) {
  if (!branch) return <span className="text-xs" style={{ color: 'var(--t-text4)' }}>—</span>
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${BRANCH_BG[branch]}`}>
      {branch}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_CONFIG.find(p => p.value === priority)
  if (!config) return null
  return (
    <span className="text-sm leading-none" title={config.label}>
      {config.icon}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Not Yet': 'bg-gray-200 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400',
    'Ongoing':  'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    'Done':     'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${styles[status] ?? 'bg-gray-200 text-gray-600'}`}>
      {status}
    </span>
  )
}
