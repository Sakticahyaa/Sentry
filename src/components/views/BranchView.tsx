import { useMemo } from 'react'
import { parseISO, isPast } from 'date-fns'
import type { Task, Branch } from '../../types/task'
import { TaskCard } from '../TaskCard'
import { BRANCHES, BRANCH_COLORS } from '../../constants/branches'

interface BranchViewProps {
  tasks: Task[]
  activeBranch: Branch | null
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCycle: (task: Task) => Promise<void>
}

export function BranchView({ tasks, activeBranch, onEdit, onDelete, onCycle }: BranchViewProps) {
  const branches = activeBranch ? [activeBranch] : BRANCHES

  const groupedByBranch = useMemo(() => {
    const map = new Map<Branch, Task[]>()
    for (const b of branches) {
      map.set(b, tasks
        .filter(t => t.branch === b)
        .sort((a, b) => {
          // Sort by deadline (nulls last), then priority
          if (!a.deadline && !b.deadline) return a.priority - b.priority
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return a.deadline.localeCompare(b.deadline)
        })
      )
    }
    return map
  }, [tasks, branches])

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      {branches.map(branch => {
        const branchTasks = groupedByBranch.get(branch) ?? []
        const overdue = branchTasks.filter(t =>
          t.deadline && isPast(parseISO(t.deadline)) && t.status !== 'Done'
        ).length
        const done = branchTasks.filter(t => t.status === 'Done').length
        const pct = branchTasks.length > 0 ? Math.round((done / branchTasks.length) * 100) : 0

        if (branchTasks.length === 0 && !activeBranch) return null

        return (
          <div key={branch}>
            {/* Branch header */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: BRANCH_COLORS[branch] }}
              />
              <h2 className="font-semibold text-gray-100">{branch}</h2>
              <span className="text-xs text-gray-600">{branchTasks.length} tugas</span>
              {overdue > 0 && (
                <span className="text-xs text-red-400 bg-red-950 px-1.5 py-0.5 rounded">
                  {overdue} terlambat
                </span>
              )}
              <div className="ml-auto flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: BRANCH_COLORS[branch],
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">{pct}%</span>
              </div>
            </div>

            {branchTasks.length > 0 ? (
              <div className="space-y-2">
                {branchTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onCycle={onCycle}
                    isDraggable={false}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700 py-4 text-center border border-dashed border-gray-800 rounded-xl">
                Tidak ada tugas di branch ini
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
