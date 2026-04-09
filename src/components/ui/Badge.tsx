import type { Branch, Priority } from '../../types/task'
import { PRIORITY_CONFIG } from '../../constants/timeblocks'
import { useBranchColor } from '../../hooks/useBranches'

export function BranchBadge({ branch }: { branch: Branch | null }) {
  const color = useBranchColor(branch ?? null)
  if (!branch) return null
  return (
    <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--t-text2)' }}>
      <span style={{ width: 3, height: 13, borderRadius: 2, backgroundColor: color, flexShrink: 0, display: 'inline-block' }} />
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
