import type { Branch, Priority } from '../../types/task'
import { BRANCH_BG } from '../../constants/branches'
import { PRIORITY_CONFIG } from '../../constants/timeblocks'

export function BranchBadge({ branch }: { branch: Branch | null }) {
  if (!branch) return <span className="text-xs text-gray-600">—</span>
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
    'Not Yet': 'bg-gray-700 text-gray-300',
    'Ongoing': 'bg-blue-500/20 text-blue-400',
    'Done': 'bg-green-500/20 text-green-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${styles[status] ?? 'bg-gray-700 text-gray-300'}`}>
      {status}
    </span>
  )
}
