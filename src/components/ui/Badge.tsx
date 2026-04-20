import type { Branch } from '../../types/task'
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
