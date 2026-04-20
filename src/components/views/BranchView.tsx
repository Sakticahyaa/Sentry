import { useMemo } from 'react'
import type { Task, Branch } from '../../types/task'
import { TaskCard } from '../TaskCard'
import { useBranchList, useBranchColor } from '../../hooks/useBranches'

interface BranchViewProps {
  tasks: Task[]
  activeBranch: Branch | null
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function BranchStrip({ name }: { name: string }) {
  const color = useBranchColor(name)
  return <span style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: color, flexShrink: 0, display: 'inline-block' }} />
}

interface BranchSectionProps {
  branch: Branch
  tasks: Task[]
  showEmpty: boolean
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function BranchSection({ branch, tasks: branchTasks, showEmpty, onEdit, onDelete }: BranchSectionProps) {
  const done = branchTasks.filter(t => t.status === 'Done').length
  const pct = branchTasks.length > 0 ? Math.round((done / branchTasks.length) * 100) : 0
  const color = useBranchColor(branch)

  if (branchTasks.length === 0 && !showEmpty) return null

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <BranchStrip name={branch} />
        <h2 className="font-semibold" style={{ color: 'var(--t-text)' }}>{branch}</h2>
        <span className="text-xs" style={{ color: 'var(--t-text4)' }}>{branchTasks.length} tasks</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--t-hover)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-xs" style={{ color: 'var(--t-text3)' }}>{pct}%</span>
        </div>
      </div>

      {branchTasks.length > 0 ? (
        <div className="space-y-2">
          {branchTasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} isDraggable={false} />
          ))}
        </div>
      ) : (
        <p
          className="text-sm py-4 text-center rounded-xl border border-dashed"
          style={{ borderColor: 'var(--t-border)', color: 'var(--t-text4)' }}
        >
          No tasks in this branch
        </p>
      )}
    </div>
  )
}

export function BranchView({ tasks, activeBranch, onEdit, onDelete }: BranchViewProps) {
  const allBranches = useBranchList()
  const branches = activeBranch ? [activeBranch] : allBranches.map(b => b.name)

  const groupedByBranch = useMemo(() => {
    const map = new Map<Branch, Task[]>()
    for (const b of branches) {
      map.set(b, tasks
        .filter(t => t.branch === b)
        .sort((a, b) => a.order - b.order)
      )
    }
    return map
  }, [tasks, branches])

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {branches.map(branch => (
        <BranchSection
          key={branch}
          branch={branch}
          tasks={groupedByBranch.get(branch) ?? []}
          showEmpty={!!activeBranch}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
